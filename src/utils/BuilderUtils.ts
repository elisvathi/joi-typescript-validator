import BaseJoi from "joi";
import JoiDateExtensions from "joi-date-extensions";
import { SchemaFunction } from "..";
import { getMetadata, getOptions, getGlobalArgs } from "./MetadataHelpers";
import { FieldDescription, DescKey } from "../decorators/FieldDescription";

const Joi = BaseJoi.extend(JoiDateExtensions);
/**
 * Builds the schema for the string field
 * @param tp Field description metadata
 */

// const savedSchemas: { [key: string]: BaseJoi.Schema } = {};
const savedSchemas: Map<any, BaseJoi.Schema> = new Map<any, BaseJoi.Schema>();

function buildJoiString(tp: FieldDescription) {
    if (tp[DescKey.NON_EMPTY]) {
        tp[DescKey.MIN_LENGTH] = Math.max(tp[DescKey.MIN_LENGTH] || 0, 1);
    }
    let val = Joi.string();
    if (tp[DescKey.DATE_STRING]) {
        val = Joi.date();
        if (tp.dateStringFormat) {
            val = val.format(tp.dateStringFormat);
        }
    }
    if (tp[DescKey.MIN_LENGTH]) {
        val = val.min(tp[DescKey.MIN_LENGTH]);
    }
    if (tp[DescKey.MAX_LENGTH]) {
        val = val.max(tp[DescKey.MAX_LENGTH]);
    }
    if (tp[DescKey.EMAIL] && !tp[DescKey.DATE_STRING]) {
        val = val.email();
    }
    return val;
}

function buildJoiDate(tp: FieldDescription) {
    let val = Joi.date();
    if (tp[DescKey.DATE_STRING]) {
        if (tp.dateStringFormat) {
            val = val.format(tp.dateStringFormat);
        }
    }
    return val;
}

/**
 * Builds the schema for the number field
 * @param tp Field description metadata
 */
function buildJoiNumber(tp: FieldDescription) {
    let val = Joi.number();
    if (tp[DescKey.MIN_VALUE]) {
        val = val.min(tp[DescKey.MIN_VALUE].value);
        if (tp[DescKey.MIN_VALUE].exclude) {
            val = val.invalid(tp[DescKey.MIN_VALUE].value);
        }
    }
    if (tp[DescKey.MAX_VALUE]) {
        val = val.max(tp[DescKey.MAX_VALUE].value);
        if (tp[DescKey.MAX_VALUE].exclude) {
            val = val.invalid(tp[DescKey.MAX_VALUE].value);
        }
    }
    if (tp[DescKey.POSITIVE]) {
        val = val.positive();
    }
    if (tp[DescKey.NEGATIVE]) {
        val = val.negative();
    }
    return val;
}

/**
 * Builds a Joi array schema
 * @param tp Field description metadata
 */
function buildJoiArray(tp: FieldDescription) {
    if (tp[DescKey.NON_EMPTY]) {
        tp[DescKey.MIN_LENGTH] = Math.max(tp[DescKey.MIN_LENGTH] || 0, 1);
    }
    let val = Joi.array();
    if (tp[DescKey.TYPE_INFO]) {
        val = val.items(buildJoiChildren({ designType: tp[DescKey.TYPE_INFO] }));
    }else{
        val = val.items(Joi.any())
    }
    if (tp[DescKey.MIN_LENGTH]) {
        val = val.min(tp[DescKey.MIN_LENGTH]);
    }
    if (tp[DescKey.MAX_LENGTH]) {
        val = val.max(tp[DescKey.MAX_LENGTH]);
    }
    return val;
}

/**
 * Builds the existing schema with global conditions for all types
 * @param val existing JOI schema
 * @param tp   Field description metadata
 */
function buildJoiGlobals(val: any, tp: FieldDescription) {
    if (tp[DescKey.NULLABLE]) {
        val = val.allow(null);
    }
    if (tp.options && tp.options.length > 0) {
        val = val.valid(...tp.options);
    }
    if (tp[DescKey.REQUIRED]) {
        val = val.required();
    } else {
        val = val.optional();
    }
    if (tp.customSchema) {
        const name = tp.customSchema.constructor.name;
        if (!!name && name === "Function") {
            if (!val) {
                val = BaseJoi.empty();
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
                val = BaseJoi.empty();
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
    const payload: any = {};
    const metadata = getMetadata(tp.designType);
    if (!metadata) {
        return Joi.any();
    }
    Object.keys(metadata).forEach((x) => {
        payload[x] = buildJoiChildren(metadata[x]);
    });
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
    const primitives = ["String", "Boolean", "Number", "Array", "Date"];
    let val;
    if (primitives.includes(tp.designType.name)) {
        const typename = tp.designType.name;
        if (typename === "String") {
            val = buildJoiString(tp);
        } else if (typename === "Boolean") {
            val = Joi.boolean();
        } else if (typename === "Number") {
            val = buildJoiNumber(tp);
        } else if (typename === "Array") {
            val = buildJoiArray(tp);
        } else if (typename === "Date") {
            val = buildJoiDate(tp);
        }
    } else {
        val = buildJoiObject(tp);
    }
    val = buildJoiGlobals(val, tp);
    return val;
}

/**
 * Returns the schema for the root type
 * @param tp type to validate
 */
function buildJoiRoot(tp: any): BaseJoi.Schema {
    const metadata = getMetadata(tp);
    if (!metadata) {
        return Joi.any();
    }
    const payload: any = {};
    Object.keys(metadata).forEach((x) => {
        payload[x] = buildJoiChildren(metadata[x]);
    });
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
                result = BaseJoi.empty();
            }
            result = (globals as SchemaFunction)(result);
        } else {
            result = globals;
        }
    }
    return result;
}

/**
 * Returns the schema for the root type
 * @param tp type to validate
 * @param save
 */
export function getSchema(tp: any, save: boolean = true): BaseJoi.Schema {
    if (savedSchemas.has(tp)) {
        return savedSchemas.get(tp);
    }
    const result = buildJoiRoot(tp);
    if (save) {
        savedSchemas.set(tp, result);
    }
    return result;
}

export function getSchemaDescription(tp: any, save: boolean = true): BaseJoi.Description {
    return getSchema(tp, save).describe();
}

/**
 * Validates the object, returns the object if success, or throws a Joi Validation Error
 * @param obj Any object
 * @param save
 */
export async function Validate(ctor: any, obj: any, save: boolean = true) {
    const cp: any = ctor;
    const validator: BaseJoi.Schema = getSchema(cp, save);
    return Joi.validate(obj, validator);
}
