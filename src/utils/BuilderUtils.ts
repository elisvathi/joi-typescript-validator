import BaseJoi from "joi";
import JoiDateFactory from "@joi/date";

import { getMetadata, getOptions, getGlobalArgs } from "./MetadataHelpers";
import { FieldDescription } from "../decorators/FieldDescription";
import { Class } from "../types";

/**
 * Joi instance customized with JoiDateFactory extension
 */
const Joi = BaseJoi.extend(JoiDateFactory) as BaseJoi.Root;

/**
 * Map of saved schemas for faster access internally.
 * Prevents regenerating schemas that have already been generated
 * @type {Map<Class<unknown>, BaseJoi.Schema>}
 */
const savedSchemas = new Map<Class<unknown>, BaseJoi.Schema>();

/**
 * Build string field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.StringSchema}
 */
function buildJoiString(description: FieldDescription) {
  let schema = Joi.string();

  if (description.minLength || description.nonempty) {
    schema = schema.min(Math.max(description.minLength || 0, 1));
  }

  if (description.maxLength) {
    schema = schema.max(description.maxLength);
  }

  if (description.email) {
    schema = schema.email();
  }

  return schema;
}

/**
 * Build date field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.DateSchema}
 */
function buildJoiDate(description: FieldDescription) {
  let schema = Joi.date();

  if (description.dateString && description.dateStringFormat) {
    schema = schema.format(description.dateStringFormat);
  }

  return schema;
}

/**
 * Build number field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.NumberSchema}
 */
function buildJoiNumber(description: FieldDescription) {
  let schema = Joi.number();

  if (description.minValue) {
    schema = schema.min(description.minValue.value);

    if (description.minValue.exclude) {
      schema = schema.invalid(description.minValue.value);
    }
  }

  if (description.maxValue) {
    schema = schema.max(description.maxValue.value);

    if (description.maxValue.exclude) {
      schema = schema.invalid(description.maxValue.value);
    }
  }

  if (description.positive) {
    schema = schema.positive();
  }

  if (description.negative) {
    schema = schema.negative();
  }

  return schema;
}

/**
 * Build array field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.ArraySchema}
 */
function buildJoiArray(description: FieldDescription) {
  let schema = Joi.array();

  if (description.typeInfo) {
    schema = schema.items(buildJoiChildren({ designType: description.typeInfo }));
  } else {
    schema = schema.items(Joi.any());
  }

  if (description.minLength || description.nonempty) {
    schema = schema.min(Math.max(description.minLength || 0, 1));
  }

  if (description.maxLength) {
    schema = schema.max(description.maxLength);
  }

  return schema;
}

/**
 * Extend field Joi schema with global conditions
 * @param {BaseJoi.Schema}   fieldSchema Field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.Schema}
 */
function buildJoiGlobals(fieldSchema: BaseJoi.Schema, description: FieldDescription) {
  let schema = fieldSchema;

  if (description.nullable) {
    schema = schema.allow(null);
  }

  if (description.options) {
    schema = schema.valid(...description.options);
  }

  if (description.required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (description.customSchema) {
    if (typeof description.customSchema === "function") {
      schema = description.customSchema(schema || Joi.any().empty());
    } else {
      schema = description.customSchema;
    }
  }

  const globals = getGlobalArgs(description.designType);
  if (globals) {
    if (typeof globals === "function") {
      schema = globals(schema || Joi.any().empty());
    } else {
      schema = globals;
    }
  }

  return schema;
}

/**
 * Build non-primitive object field Joi schema
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.ObjectSchema}
 */
function buildJoiObject(description: FieldDescription) {
  const metadata = getMetadata(description.designType);
  if (!metadata) {
    return Joi.any();
  }

  const payload = Object.keys(metadata).reduce((acc, item) => ({
    ...acc,
    [item]: buildJoiChildren(metadata[item]),
  }), {});

  const schema = Joi.object().keys(payload);
  const options = getOptions(description.designType);

  return options ? schema.options(options) : schema;
}

/**
 * Build field schema depending on type
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.Schema}
 */
function buildFieldSchema(description: FieldDescription) {
  const designType = description.dateString ? "Date" : description.designType?.name;

  switch (designType) {
    case "Array":
      return buildJoiArray(description);
    case "Date":
      return buildJoiDate(description);
    case "Boolean":
      return Joi.boolean();
    case "Number":
      return buildJoiNumber(description);
    case "String":
      return buildJoiString(description);
    default:
      return buildJoiObject(description);
  }
}

/**
 * Build field schema with global conditions
 * @param {FieldDescription} description Field description object
 */
function buildJoiChildren(description: FieldDescription) {
  return buildJoiGlobals(buildFieldSchema(description), description);
}

/**
 * Build Joi schema for given class
 * @template T
 * @param {Class<T>} klass Class, for which, to generate the Joi schema
 * @returns {BaseJoi.ObjectSchema}
 */
function buildJoiRoot<T>(klass: Class<T>) {
  const metadata = getMetadata(klass) || {};
  const partialSchema = Object.keys(metadata).reduce((acc, item) => ({
    ...acc,
    [item]: buildJoiChildren(metadata[item]),
  }), {});

  const options = getOptions(klass);
  const globals = getGlobalArgs(klass);

  const objectSchema = BaseJoi.object().keys(partialSchema);
  const schema = options ? objectSchema.options(options) : objectSchema;

  if (globals) {
    if (typeof globals === "function") {
      return globals(schema || Joi.any().empty());
    }

    return globals;
  }

  return schema;
}

/**
 * Returns Joi schema for the given class
 * @template T
 * @param {Class<T>} klass             Class for which to get or build the schema
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Schema} Joi Schema
 */
export function getSchema<T>(klass: Class<T>, shouldSave = true) {
  const schema = savedSchemas.get(klass) || buildJoiRoot(klass);

  if (shouldSave) {
    savedSchemas.set(klass, schema);
  }

  return schema;
}

/**
 * Returns a plain object representing the schema's rules and properties for the given class
 * @template T
 * @param {Class<T>} klass             Class for which to get the schema's rules and properties
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Description} Joi schema's rules and properties
 */
export function getSchemaDescription<T>(klass: Class<T>, shouldSave = true) {
  return getSchema(klass, shouldSave).describe();
}

/**
 * Validates the class instance object and returns Joi validation result
 * @template T
 * @param {Class<T>} klass             Class of object
 * @param {object}   instance          Class instance object
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.ValidationResult} Joi ValidationResult
 */
export function Validate<T extends object>(klass: Class<T>, instance: T, shouldSave = true) {
  return getSchema(klass, shouldSave).validate(instance);
}
