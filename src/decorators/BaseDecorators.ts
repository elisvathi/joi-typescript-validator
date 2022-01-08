import "reflect-metadata";
import Joi, { ValidationOptions } from "joi";

import { Class } from "../types";
import { FieldDescription } from "./FieldDescription";

/**
 * Joi Schema or Joi SchemaFunction
 */
export type SchemaArgs = Joi.Schema | Joi.SchemaFunction;

/**
 * MetadataKeys constant object containing Reflect metadata keys
 */
export const MetadataKeys = { Fields: "validate:fields" };

/**
 * Threshold interface, describing a maximum or minimum (exclusive or inclusive) limit
 */
export interface Threshold {
  /**
   * Limit value
   */
  value: number;

  /**
   * Mark to set limit as exclusive
   */
  exclude?: boolean;
}

/**
 * ConditionSchema interface, describing Joi schema based on condition value
 */
export interface ConditionSchema {
  /**
   * Condition function to return boolean value
   */
  condition: (_args: unknown[]) => boolean;

  /**
   * Joi schema when condition evaluates to true
   */
  truthy: Joi.Schema;

  /**
   * Joi schema when condition evaluates to false
   */
  falsy: Joi.Schema;
}

/**
 * Key-value index signature containing description metadata for each field
 */
export type FieldsMap = { [key: string]: FieldDescription };

/**
 * Class description metadata
 */
export class ClassDescription {
  /**
   * Class fields object containing each field's FieldDescription
   */
  public fields?: FieldsMap;

  /**
   * Class options attached with `@SchemaOptions` decorator
   */
  public options?: ValidationOptions;

  /**
   * Class globalArgs attached with `@CustomSchema` decorator
   */
  public globalArgs?: SchemaArgs;
}

/**
 * Class tree metadata
 */
export type TreeMetadata = Map<unknown, ClassDescription>;

/**
 * Attach field design type and description to class prototype metadata
 * @template T
 * @param {T}                target      Class prototype to attach field design type and description to
 * @param {string}           propertyKey Field key to identify the field, for which, to set the description and design type
 * @param {FieldDescription} description Field description metadata to attach to class prototype
 */
function setFieldDescription<T extends object>(target: T, propertyKey: string, description: FieldDescription) {
  const designType = Reflect.getMetadata("design:type", target, propertyKey) as Class<unknown>;
  const metadata = getFieldsMetadata(target);
  const classDescription = metadata.get(target.constructor) || {};

  const fields = classDescription.fields || {};
  fields[propertyKey] = fields[propertyKey] || {};
  fields[propertyKey] = { ...fields[propertyKey], designType, ...description };

  metadata.set(target.constructor, { ...classDescription, fields });

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
  const classDescription = metadata.get(klass) || {};

  metadata.set(klass, { ...classDescription, globalArgs: args });

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
  const classDescription = metadata.get(klass) || {};

  metadata.set(klass, { ...classDescription, options });

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
export function Required<T extends object>() {
  return (target: T, propertyKey: string) => {
    const description = { required: true };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Mark field value as optional
 * @template T
 */
export function Optional<T extends object>() {
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
export function Nullable<T extends object>(isEnabled = true) {
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
export function ItemType<T extends object, I>(type: Class<I>) {
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
export function Max<T extends object>(value: Threshold | number) {
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
export function Min<T extends object>(value: Threshold | number) {
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
export function Positive<T extends object>(isEnabled = true) {
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
export function Negative<T extends object>(isEnabled = true) {
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
export function NotEmpty<T extends object>(isEnabled = true) {
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
export function MaxLength<T extends object>(value: number) {
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
export function MinLength<T extends object>(value: number) {
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
export function ValidOptions<T extends object>(...args: unknown[]) {
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
export function Email<T extends object>(isEnabled = true) {
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
export function DateString<T extends object>(format = "YYYY-MM-DD") {
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
export function CustomSchema<T extends object>(schema: SchemaArgs) {
  return (target: T, propertyKey?: string) => {
    if (propertyKey) {
      const description = { customSchema: schema };
      setFieldDescription(target, propertyKey, description);
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
