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

export type SchemaFunction = (args: Joi.Schema) => Joi.Schema;
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
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, new target());
    existingInstance = existingInstance || new Map();
    existingInstance.set(target.constructor, existingInstance.get(target.constructor) || {});
    existingInstance.get(target.constructor).globalArgs = fun;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

function setSchemaOptions(target: any, options: ValidationOptions){
    let existingInstance: TreeMetadata = Reflect.getMetadata(MetadataKeys.Fields, new target());
    existingInstance = existingInstance || new Map();
    existingInstance.set(target.constructor, existingInstance.get(target.constructor) || {});
    existingInstance.get(target.constructor).options = options;
    Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

/**
 * Marks field as required
 * If overridden by Optional the required flag might be turned off depending which decorations gets called last
 */
export function Required() {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { required: true };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Allows the field to have null value
 */
export function Nullable(enable: boolean = true) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { nullable: enable };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Marks field as optional
 * If overridden by Required the required flag might be turned on depending which decorations gets called last
 */
export function Optional() {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { required: false };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 *  Used to specify the array type
 * @param tp Array item type  (must be a Class not interface or type since it will be used as a value )
 */
export function ItemType(tp: any) {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { typeInfo: tp };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Max value for a number field
 * @param value Number or threshold object
 */
export function Max(value: Threshold | number) {
    return (target: any, propertyKey: string) => {
        let mValue: Threshold;
        if (typeof (value) === "number") {
            mValue = { value: value as number };
        } else {
            mValue = value as Threshold;
        }
        const description: FieldDescription = { maxValue: mValue };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Max length for a string or array field
 * @param value maxLength
 */
export function MaxLength(value: number) {
    return (target: any, propertyKey: string) => {
        const description: FieldDescription = { maxLength: value };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Min value for a number field
 * @param value Number or threshold object
 */
export function Min(value: Threshold | number) {
    let mValue: Threshold;
    if (typeof (value) === "number") {
        mValue = { value: value as number };
    } else {
        mValue = value as Threshold;
    }
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { minValue: mValue };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Positive number only
 * @param enable Optional , use if you need to disable in derived classes
 */
export function Positive(enable: boolean = true) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { positive: enable };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Negative number only
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Negative(enable: boolean = true) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { negative: enable };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Non empty array or string
 * @param enable Optional, use if you need to disable in derived classes
 */
export function NotEmpty(enable: boolean = true) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { nonempty: enable };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Minimum length for arrays and strings
 * @param value
 */
export function MinLength(value: number) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { minLength: value };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Specify a list of allowed values for the field
 * @param args List of allowed values
 */
export function ValidOptions(...args: any[]) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { options: args };
        setFieldDescription(target, propertyKey, description);
    };
}

/**
 * Non empty arrays or strings
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Email(enable: boolean = true) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { email: enable };
        setFieldDescription(target, propertyKey, description);
    };
}

export function DateString(format: string = "YYYY-MM-DD") {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = { dateString: true, dateStringFormat: format };
        setFieldDescription(target, propertyKey, description);
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
