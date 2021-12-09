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
 *  Attaches the default metadata such es design:type to the field descriptions,
 *  keeps the existing metadata if any,
 *  and adds the new metadata to that field
 * @param target  Target class
 * @param propertyKey Field name
 * @param description Partial field metadata object
 */
function setFieldDescription(target: any, propertyKey: string, description: FieldDescription) {
    const DesignType = Reflect.getMetadata("design:type", target, propertyKey);
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, target);
    existingInstance = existingInstance || new Map();
    existingInstance.set(target.constructor, existingInstance.get(target.constructor) || {});
    const existingFields: any = existingInstance.get(target.constructor).fields || {};
    existingFields[propertyKey] = existingFields[propertyKey] || {};
    existingFields[propertyKey].designType = DesignType;
    existingFields[propertyKey] = { ...existingFields[propertyKey], ...description };
    existingInstance.get(target.constructor).fields = existingFields;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

function setSchemaGlobals(target: any, fun: SchemaArgs) {
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, target.prototype);
    existingInstance = existingInstance || new Map();
    existingInstance.set(target, existingInstance.get(target) || {});
    existingInstance.get(target).globalArgs = fun;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

function setSchemaOptions(target: any, options: ValidationOptions){
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, target.prototype);
    existingInstance = existingInstance || new Map();
    existingInstance.set(target, existingInstance.get(target) || {});
    existingInstance.get(target).options = options;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
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
