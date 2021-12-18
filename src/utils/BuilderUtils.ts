import BaseJoi from "joi";
import JoiDateFactory from "@joi/date";
import { SchemaFunction } from "..";
import { getMetadata, getOptions, getGlobalArgs } from "./MetadataHelpers";
import { FieldDescription } from "../decorators/FieldDescription";
import { Class } from "../types";

const Joi = BaseJoi.extend(JoiDateFactory);

/**
 * Map of saved schemas for faster access internally.
 * Prevents regenerating schemas that have already been generated
 * @type {Map<Class<unknown>, BaseJoi.Schema>}
 */
const savedSchemas = new Map<Class<unknown>, BaseJoi.Schema>();

/**
 * Builds the schema for the string field
 * @param tp Field description metadata
 */
function buildJoiString(tp: FieldDescription) {
  if (tp.nonempty) {
    tp.minLength = Math.max(tp.minLength || 0, 1);
  }

  let val = Joi.string();

  if (tp.dateString) {
    val = Joi.date();

    if (tp.dateStringFormat) {
      val = val.format(tp.dateStringFormat);
    }
  }

  if (tp.minLength) {
    val = val.min(tp.minLength);
  }

  if (tp.maxLength) {
    val = val.max(tp.maxLength);
  }

  if (tp.email && !tp.dateString) {
    val = val.email();
  }

  return val;
}

function buildJoiDate(tp: FieldDescription) {
  let val = Joi.date();

  if (tp.dateString && tp.dateStringFormat) {
    val = val.format(tp.dateStringFormat);
  }

  return val;
}

/**
 * Builds the schema for the number field
 * @param tp Field description metadata
 */
function buildJoiNumber(tp: FieldDescription) {
  let val = Joi.number();

  if (tp.minValue) {
    val = val.min(tp.minValue.value);

    if (tp.minValue.exclude) {
      val = val.invalid(tp.minValue.value);
    }
  }

  if (tp.maxValue) {
    val = val.max(tp.maxValue.value);

    if (tp.maxValue.exclude) {
      val = val.invalid(tp.maxValue.value);
    }
  }

  if (tp.positive) {
    val = val.positive();
  }

  if (tp.negative) {
    val = val.negative();
  }

  return val;
}

/**
 * Builds a Joi array schema
 * @param tp Field description metadata
 */
function buildJoiArray(tp: FieldDescription) {
  if (tp.nonempty) {
    tp.minLength = Math.max(tp.minLength || 0, 1);
  }

  let val = Joi.array();

  if (tp.typeInfo) {
    val = val.items(buildJoiChildren({ designType: tp.typeInfo }));
  } else {
    val = val.items(Joi.any());
  }

  if (tp.minLength) {
    val = val.min(tp.minLength);
  }

  if (tp.maxLength) {
    val = val.max(tp.maxLength);
  }

  return val;
}

/**
 * Builds the existing schema with global conditions for all types
 * @param val existing JOI schema
 * @param tp   Field description metadata
 */
function buildJoiGlobals(val: any, tp: FieldDescription) {
  if (tp.nullable) {
    val = val.allow(null);
  }

  if (tp.options && tp.options.length > 0) {
    val = val.valid(...tp.options);
  }

  if (tp.required) {
    val = val.required();
  } else {
    val = val.optional();
  }

  if (tp.customSchema) {
    const name = tp.customSchema.constructor.name;
    if (!!name && name === "Function") {
      if (!val) {
        val = BaseJoi.any().empty();
      }

      val = (tp.customSchema as SchemaFunction)(val);
    } else {
      val = tp.customSchema;
    }
  }

  const globals = getGlobalArgs(tp.designType);
  if (globals) {
    const name = globals.constructor.name;
    if (!!name && name === "Function") {
      if (!val) {
        val = BaseJoi.any().empty();
      }

      val = (tp.customSchema as SchemaFunction)(val);
    } else {
      val = globals;
    }
  }

  return val;
}

/**
 * Returns Joi schema for a non-primitive or array object
 * @param tp Field description metadata
 */
function buildJoiObject(tp: FieldDescription) {
  const metadata = getMetadata(tp.designType);
  if (!metadata) {
    return Joi.any();
  }

  const payload = Object.keys(metadata).reduce((acc, item) => {
    acc[item] = buildJoiChildren(metadata[item]);
    return acc;
  }, {});

  let result = Joi.object().keys(payload);
  const options = getOptions(tp.designType);
  if (options) {
    result = result.options(options);
  }

  return result;
}

/**
 * Build field schema depending on type
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.Schema}
 */
function buildFieldSchema(description: FieldDescription) {
  const designType = description.dateString ? "Date" : description.designType?.name as string;

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
  const globals = getGlobalArgs(klass) as BaseJoi.Schema | BaseJoi.SchemaFunction;

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
