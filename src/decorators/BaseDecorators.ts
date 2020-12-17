import Joi, { ValidationOptions } from "joi";
import "reflect-metadata";
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
function setFieldDescription(target: any, propertyKey: string, description: FieldDescription, message?: string) {
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

function setSchemaOptions(target: any, options: ValidationOptions) {
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, target.prototype);
    existingInstance = existingInstance || new Map();
    existingInstance.set(target, existingInstance.get(target) || {});
    existingInstance.get(target).options = options;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

/**
 * Marks field as required
 * If overridden by Optional the required flag might be turned off depending which decorations gets called last
 */
export function Required(message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.REQUIRED]: true };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Allows the field to have null value
 */
export function Nullable(enable: boolean = true, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.NULLABLE]: enable };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Marks field as optional
 * If overridden by Required the required flag might be turned on depending which decorations gets called last
 */
export function Optional(message?: string) {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { [DescKey.REQUIRED]: false };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 *  Used to specify the array type
 * @param tp Array item type  (must be a Class not interface or type since it will be used as a value )
 */
export function ItemType(tp: any, message?: string) {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { [DescKey.TYPE_INFO]: tp };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Max value for a number field
 * @param value Number or threshold object
 */
export function Max(value: Threshold | number, message?: string) {
    return (target: any, propertyKey: string) => {
        let mValue: Threshold;
        if (typeof (value) === "number") {
            mValue = { value: value as number };
        } else {
            mValue = value as Threshold;
        }
        const description: FieldDescription = { [DescKey.MAX_VALUE]: mValue };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Max length for a string or array field
 * @param value maxLength
 */
export function MaxLength(value: number, message?: string) {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { [DescKey.MAX_LENGTH]: value };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Min value for a number field
 * @param value Number or threshold object
 */
export function Min(value: Threshold | number, message?: string) {
    let mValue: Threshold;
    if (typeof (value) === "number") {
        mValue = { value: value as number };
    } else {
        mValue = value as Threshold;
    }
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.MIN_VALUE]: mValue };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Positive number only
 * @param enable Optional , use if you need to disable in derived classes
 */
export function Positive(enable: boolean = true, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.POSITIVE]: enable };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Negative number only
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Negative(enable: boolean = true, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.NEGATIVE]: enable };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Non empty array or string
 * @param enable Optional, use if you need to disable in derived classes
 */
export function NotEmpty(enable: boolean = true, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.NON_EMPTY]: enable };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Minimum length for arrays and strings
 * @param value
 */
export function MinLength(value: number, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.MIN_LENGTH]: value };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Specify a list of allowed values for the field
 * @param args List of allowed values
 */
export function ValidOptions(args: any[], message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { options: args };
        setFieldDescription(target, propertyKey, description, message);
    };
}

/**
 * Non empty arrays or strings
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Email(enable: boolean = true, message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.EMAIL]: enable };
        setFieldDescription(target, propertyKey, description, message);
    };
}

export function DateString(format: string = "YYYY-MM-DD", message?: string) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { [DescKey.DATE_STRING]: true, dateStringFormat: format };
        setFieldDescription(target, propertyKey, description, message);
    };
}

export function CustomSchema(schema: SchemaArgs) {
    return function(target: any, propertyKey?: string) {
        if (propertyKey) {
            const description: FieldDescription = { customSchema: schema };
            setFieldDescription(target, propertyKey, description);
        } else {
            setSchemaGlobals(target, schema);
        }
    };
}

export function SchemaOptions(options: ValidationOptions) {
    return (target: any) => {
        setSchemaOptions(target, options);
    }
}
