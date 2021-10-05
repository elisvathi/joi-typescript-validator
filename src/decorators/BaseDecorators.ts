import Joi, { ValidationOptions } from 'joi';
import 'reflect-metadata';
import { FieldDescription, DescKey, Class } from './FieldDescription';
export const MetadataKeys = {
  Fields: 'validate:fields',
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
function setFieldDescription(
  target: any,
  propertyKey: string,
  description: FieldDescription
) {
  const DesignType = Reflect.getMetadata('design:type', target, propertyKey);
  let existingInstance: TreeMetadata = Reflect.getMetadata(
    MetadataKeys.Fields,
    target
  );
  existingInstance = existingInstance || new Map();
  existingInstance.set(
    target.constructor,
    existingInstance.get(target.constructor) || {}
  );
  const existingFields: { [key: string]: FieldDescription } =
    existingInstance.get(target.constructor).fields || {};
  existingFields[propertyKey] = existingFields[propertyKey] || {};
  existingFields[propertyKey].designType = DesignType;
  existingFields[propertyKey].name = propertyKey;
  if (description.messages) {
    const existingMessages = existingFields[propertyKey].messages || new Map();
    description.messages.forEach((value, key) => {
      existingMessages.set(key, value);
    });
    existingFields[propertyKey].messages = existingMessages;
    delete description.messages;
  }
  existingFields[propertyKey] = {
    ...existingFields[propertyKey],
    ...description,
  };
  existingInstance.get(target.constructor).fields = existingFields;
  Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

function setSchemaGlobals(target: any, fun: SchemaArgs) {
  let existingInstance: TreeMetadata = Reflect.getMetadata(
    MetadataKeys.Fields,
    target.prototype
  );
  existingInstance = existingInstance || new Map();
  existingInstance.set(target, existingInstance.get(target) || {});
  existingInstance.get(target).globalArgs = fun;
  Reflect.defineMetadata(MetadataKeys.Fields, existingInstance, target);
}

function setSchemaOptions(target: any, options: ValidationOptions) {
  let existingInstance: TreeMetadata = Reflect.getMetadata(
    MetadataKeys.Fields,
    target.prototype
  );
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
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.REQUIRED]: true };
    if (message) {
      description.messages = new Map([[DescKey.REQUIRED, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Allows the field to have null value
 */
export function Nullable(enable: boolean = true, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.NULLABLE]: enable };
    if (message) {
      description.messages = new Map([[DescKey.NULLABLE, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Marks field as optional
 * If overridden by Required the required flag might be turned on depending which decorations gets called last
 */
export function Optional() {
  return (target: any, propertyKey: string) => {
    const description: FieldDescription = { [DescKey.REQUIRED]: false };
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 *  Used to specify the array type
 * @param tp Array item type  (must be a Class not interface or type since it will be used as a value )
 */
export function ItemType(tp: any, message?: string) {
  return (target: any, propertyKey: string) => {
    const description: FieldDescription = { [DescKey.TYPE_INFO]: tp };
    if (message) {
      description.messages = new Map([[DescKey.TYPE_INFO, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Max value for a number field
 * @param value Number or threshold object
 */
export function Max(value: Threshold | number, message?: string) {
  return (target: any, propertyKey: string) => {
    let mValue: Threshold;
    if (typeof value === 'number') {
      mValue = { value: value as number };
    } else {
      mValue = value as Threshold;
    }
    const description: FieldDescription = { [DescKey.MAX_VALUE]: mValue };
    if (message) {
      description.messages = new Map([[DescKey.MAX_VALUE, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Max length for a string or array field
 * @param value maxLength
 */
export function MaxLength(value: number, message?: string) {
  return (target: any, propertyKey: string) => {
    const description: FieldDescription = { [DescKey.MAX_LENGTH]: value };
    if (message) {
      description.messages = new Map([[DescKey.MAX_LENGTH, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Min value for a number field
 * @param value Number or threshold object
 */
export function Min(value: Threshold | number, message?: string) {
  let mValue: Threshold;
  if (typeof value === 'number') {
    mValue = { value: value as number };
  } else {
    mValue = value as Threshold;
  }
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.MIN_VALUE]: mValue };
    if (message) {
      description.messages = new Map([[DescKey.MIN_VALUE, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Positive number only
 * @param enable Optional , use if you need to disable in derived classes
 */
export function Positive(enable: boolean = true, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.POSITIVE]: enable };
    if (message) {
      description.messages = new Map([[DescKey.POSITIVE, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Negative number only
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Negative(enable: boolean = true, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.NEGATIVE]: enable };
    if (message) {
      description.messages = new Map([[DescKey.NEGATIVE, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Non empty array or string
 * @param enable Optional, use if you need to disable in derived classes
 */
export function NotEmpty(enable: boolean = true, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.NON_EMPTY]: enable };
    if (message) {
      description.messages = new Map([[DescKey.NON_EMPTY, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Minimum length for arrays and strings
 * @param value
 */
export function MinLength(value: number, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.MIN_LENGTH]: value };
    if (message) {
      description.messages = new Map([[DescKey.MIN_LENGTH, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Specify a list of allowed values for the field
 * @param args List of allowed values
 */
export function ValidOptions(args: any[], message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.VALID_OPTIONS]: args };
    if (message) {
      description.messages = new Map([[DescKey.VALID_OPTIONS, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

/**
 * Non empty arrays or strings
 * @param enable Optional, use if you need to disable in derived classes
 */
export function Email(enable: boolean = true, message?: string) {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = { [DescKey.EMAIL]: enable };
    if (message) {
      description.messages = new Map([[DescKey.EMAIL, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

export function DateString(
  format: string = 'YYYY-MM-DD',
  message?: string
): PropertyDecorator {
  return function (target: any, propertyKey: string) {
    const description: FieldDescription = {
      [DescKey.DATE_STRING]: true,
      dateStringFormat: format,
    };
    if (message) {
      description.messages = new Map([[DescKey.DATE_STRING, message]]);
    }
    setFieldDescription(target, propertyKey, description);
  };
}

export function CustomSchema(schema: SchemaArgs) {
  console.log('CALLED CUSTOM SCHEMA');
  return (target: any, propertyKey?: string) => {
    if (propertyKey) {
      const description: FieldDescription = { customSchema: schema };
      setFieldDescription(target, propertyKey, description);
    } else {
      setSchemaGlobals(target, schema);
    }
  };
}

export function SchemaOptions(options: ValidationOptions): ClassDecorator {
  return (target: any) => {
    setSchemaOptions(target, options);
  };
}

export function Union(
  ...args: Array<Class | Joi.AnySchema>
): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const description: FieldDescription = { union: args };
    setFieldDescription(target, propertyKey, description);
  };
}
