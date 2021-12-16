import Joi, { ValidationOptions } from "joi";
import "reflect-metadata";
import { Class } from "../types";
import { FieldDescription } from "./FieldDescription";

export const MetadataKeys = {
    Fields: "validate:fields"
};

/**
 *  Threshold used for min and max constraints for numbers,
 *  if exclude specified,
 *  adjusts if the threshold value is inclusive or exclusive
 */

export type SchemaFunction = (args: Joi.Schema) => Joi.Schema | Joi.Schema[];
export type SchemaArgs = Joi.Schema | SchemaFunction;

export interface Threshold {
    value: number;
    exclude?: boolean;
}

export interface ConditionSchema {
    condition: (args: any) => boolean;
    truthy: Joi.Schema;
    falsy: Joi.Schema;
}

export class ClassDescription {
    public fields?: { [key: string]: FieldDescription };
    public globalArgs?: SchemaArgs;
    public options?: ValidationOptions;
}
export type TreeMetadata = Map<any, ClassDescription>;

/**
 * Attach field design type and description to class prototype metadata
 * @template T
 * @param {T}                target      Class prototype to attach field design type and description to
 * @param {string}           propertyKey Field key to identify the field, for which, to set the description and design type
 * @param {FieldDescription} description Field description metadata to attach to class prototype
 */
function setFieldDescription<T>(target: T, propertyKey: string, description: FieldDescription) {
  const designType = Reflect.getMetadata("design:type", target, propertyKey) as object;
  const metadata = (Reflect.getMetadata(MetadataKeys.Fields, target) || new Map()) as TreeMetadata;

  metadata.set(target.constructor, metadata.get(target.constructor) || {});
  const fields = metadata.get(target.constructor).fields || {};
  fields[propertyKey] = fields[propertyKey] || {};
  fields[propertyKey] = { ...fields[propertyKey], designType, ...description };
  metadata.get(target.constructor).fields = fields;

  Reflect.defineMetadata(MetadataKeys.Fields, metadata, target);
}

/**
 * Attach Joi schema or schema function to class metadata as globalArgs
 * @template T
 * @param {Class<T>}   klass Class to attach globalArgs to
 * @param {SchemaArgs} args  Joi schema or schema function to attach to class
 */
function setSchemaGlobals<T>(klass: Class<T>, args: SchemaArgs) {
  const metadata = getFieldsMetadata(klass.prototype);
  metadata.set(klass, metadata.get(klass) || {});
  metadata.get(klass).globalArgs = args;

  Reflect.defineMetadata(MetadataKeys.Fields, metadata, klass);
}

/**
 * Attach Joi validation options to class metadata as options
 * @template T
 * @param {Class<T>}          klass   Class to attach validations options to
 * @param {ValidationOptions} options Validations options to attach to class
 */
function setSchemaOptions<T>(klass: Class<T>, options: ValidationOptions) {
  const metadata = getFieldsMetadata(klass.prototype);
  metadata.set(klass, metadata.get(klass) || {});
  metadata.get(klass).options = options;

  Reflect.defineMetadata(MetadataKeys.Fields, metadata, klass);
}

/**
 * Get fields metadata Map for class prototype
 * @template T
 * @param {T} target Class prototype
 * @returns {TreeMetadata} Existing fields metadata or a new empty Map
 */
function getFieldsMetadata<T>(target: T) {
  const reflectMetadata = Reflect.getMetadata(MetadataKeys.Fields, target) as TreeMetadata;
  return reflectMetadata || new Map() as TreeMetadata;
}

/**
 * Mark field value as required
 * @template T
 */
export function Required<T>() {
  return (target: T, propertyKey: string) => {
    const description = { required: true };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Mark field value as optional
 * @template T
 */
export function Optional<T>() {
  return (target: T, propertyKey: string) => {
    const description = { required: false };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Mark field value as nullable
 * @template T
 * @param {boolean} [isEnabled=true] Flag used to overwrite decorator on parent class field
 */
export function Nullable<T>(isEnabled = true) {
  return (target: T, propertyKey: string) => {
    const description = { nullable: isEnabled };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Overwrite automatic field type with the given value
 * @template T
 * @template I
 * @param {Class<I>} type Primitive or class value to set the field type to
 */
export function ItemType<T, I>(type: Class<I>) {
  return (target: T, propertyKey: string) => {
    const description = { typeInfo: type };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain number field to be less than or equal to a certain value
 * @template T
 * @param {Threshold | number} value Value, by which, to constrain the field to be less than or equal to
 */
export function Max<T>(value: Threshold | number) {
  const maxValue = typeof (value) === "number" ? { value } : value;

  return (target: T, propertyKey: string) => {
    const description = { maxValue };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain number field to be greater than or equal to a certain value
 * @template T
 * @param {Threshold | number} value Value, by which, to constrain the field to be greater than or equal to
 */
export function Min<T>(value: Threshold | number) {
  const minValue = typeof (value) === "number" ? { value } : value;

  return (target: T, propertyKey: string) => {
    const description = { minValue };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain number field to be a positive number (greater than 0)
 * @template T
 * @param {boolean} [isEnabled=true] Flag used to overwrite decorator on parent class field
 */
export function Positive<T>(isEnabled = true) {
  return (target: T, propertyKey: string) => {
    const description = { positive: isEnabled };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain number field to be a negative number (less than 0)
 * @template T
 * @param {boolean} [isEnabled=true] Flag used to overwrite decorator on parent class field
 */
export function Negative<T>(isEnabled = true) {
  return (target: T, propertyKey: string) => {
    const description = { negative: isEnabled };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain array or string field length to be greater than 0
 * @template T
 * @param {boolean} [isEnabled=true] Flag used to overwrite decorator on parent class field
 */
export function NotEmpty<T>(isEnabled = true) {
  return (target: T, propertyKey: string) => {
    const description = { nonempty: isEnabled };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain array or string field to have a maximum length
 * @template T
 * @param {number} value Value, by which, to constrain the maximum length
 */
export function MaxLength<T>(value: number) {
  return (target: T, propertyKey: string) => {
    const description = { maxLength: value };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain array or string field to have a minimum length
 * @template T
 * @param {number} value Value, by which, to constrain the minimum length
 */
export function MinLength<T>(value: number) {
  return (target: T, propertyKey: string) => {
    const description = { minLength: value };
    setFieldDescription(target, propertyKey, description);
  };
}
/**
 * Constrain field to only the allowed values passed
 * @template T
 * @param {unknown[]} args Values, by which, to constrain the field
 */
export function ValidOptions<T>(...args: unknown[]) {
  return (target: T, propertyKey: string) => {
    const description = { options: args };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain field value to be of email format
 * @template T
 * @param {boolean} [isEnabled=true] Flag used to overwrite decorator on parent class field
 */
export function Email<T>(isEnabled = true) {
  return (target: T, propertyKey: string) => {
    const description = { email: isEnabled };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain date or string field to be of a given format
 * @template T
 * @param {string} [format="YYYY-MM-DD"] Format, by which, to constrain the field
 */
export function DateString<T>(format = "YYYY-MM-DD") {
  return (target: T, propertyKey: string) => {
    const description = { dateString: true, dateStringFormat: format };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Constrain field or entire class fields by the Joi schema or function passed
 * @template T
 * @param {SchemaArgs} schema Joi schema or schema fuction, by which, to constrain field or class
 */
export function CustomSchema<T>(schema: SchemaArgs) {
  return (target: T | Class<T>, propertyKey?: string) => {
    if (propertyKey) {
      const description = { customSchema: schema };
      setFieldDescription(target as T, propertyKey, description);
    } else {
      setSchemaGlobals(target as Class<T>, schema);
    }
  };
}

/**
 * Set class schema options, to be used when generating validations
 * @template T
 * @param {ValidationOptions} options Validation options
 */
export function SchemaOptions<T>(options: ValidationOptions) {
  return (target: Class<T>) => {
    setSchemaOptions(target, options);
  };
}
