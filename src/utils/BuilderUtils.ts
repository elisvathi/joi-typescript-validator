import BaseJoi from "joi";
import JoiDateFactory from "@joi/date";
import { SchemaFunction } from "..";
import { getMetadata, getOptions, getGlobalArgs } from "./MetadataHelpers";
import { FieldDescription } from "../decorators/FieldDescription";
import { Class } from "../types";

const Joi = BaseJoi.extend(JoiDateFactory);
/**
 * Builds the schema for the string field
 * @param tp Field description metadata
 */

// const savedSchemas: { [key: string]: BaseJoi.Schema } = {};
const savedSchemas: Map<any, BaseJoi.Schema> = new Map<any, BaseJoi.Schema>();

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
 * Checks the type of the field and returns the child schema accordingly
 * @param tp field description object
 */
function buildJoiChildren(tp: FieldDescription) {
  let val;
  switch (tp.designType?.name) {
    case "String":
      val = buildJoiString(tp);
      break;
    case "Boolean":
      val = Joi.boolean();
      break;
    case "Number":
      val = buildJoiNumber(tp);
      break;
    case "Array":
      val = buildJoiArray(tp);
      break;
    case "Date":
      val = buildJoiDate(tp);
      break;
    default:
      val = buildJoiObject(tp);
      break;
  }

  val = buildJoiGlobals(val, tp);
  return val;
}

/**
 * Returns the schema for the root type
 * @param tp type to validate
 */
function buildJoiRoot(tp: any): BaseJoi.Schema {
  const metadata = getMetadata(tp) || {};
  const payload = Object.keys(metadata).reduce((acc, item) => {
    acc[item] = buildJoiChildren(metadata[item]);
    return acc;
  }, {});

  let result = Joi.object().keys(payload);

  const options = getOptions(tp);
  if (options) {
    result = result.options(options);
  }

  const globals = getGlobalArgs(tp);
  if (globals) {
    const name = globals.constructor.name;

    if (!!name && name === "Function") {
      if (!result) {
        result = BaseJoi.any().empty();
      }
      result = (globals as SchemaFunction)(result);
    } else {
      result = globals;
    }
  }

  return result;
}

/**
 * Returns the schema for the Class
 * @template T
 * @param {Class<T>} klass Class for which to get or build the schema
 * @param {boolean}  save  Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Schema} Joi Schema
 */
export function getSchema<T>(klass: Class<T>, save = true) {
  const schema = savedSchemas.get(klass) || buildJoiRoot(klass);

  if (save) {
    savedSchemas.set(klass, schema);
  }

  return schema;
}

/**
 * Returns a plain object representing the schema's rules and properties for the given class
 * @template T
 * @param {Class<T>} klass Class for which to get the schema's rules and properties
 * @param {boolean}  save  Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Description} Joi schema's rules and properties
 */
export function getSchemaDescription<T>(klass: Class<T>, save = true) {
  return getSchema(klass, save).describe();
}

/**
 * Validates the object and returns Joi ValidationResult
 * @template T
 * @param {Class<T>} klass Class of object
 * @param {object}   obj   Object
 * @param {boolean}  save  Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.ValidationResult} Joi ValidationResult
 */
export function Validate<T>(klass: Class<T>, obj: object, save = true) {
  return getSchema(klass, save).validate(obj);
}
