
import { FieldDescription } from "../decorators/BaseDecorators";
import Joi from 'joi';
import { getMetadata } from "./MetadataHelpers";

/**
 * Builds the schema for the string field 
 * @param tp Field description metadata
 */
function buildJoiString(tp: FieldDescription) {
    if (tp.nonempty) {
        tp.minLength = Math.max(tp.minLength || 0, 1);
    }
    let val = Joi.string();
    if (tp.minLength) {
        val = val.min(tp.minLength);
    }
    if (tp.maxLength) {
        val = val.max(tp.maxLength);
    }
    if (tp.email) {
        val = val.email();
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
    Object.keys(metadata).forEach(x => {
        payload[x] = buildJoiChildren(metadata[x]);
    })
    return Joi.object().keys(payload);
}

/**
 * Checks the type of the field and returns the child schema accordingly 
 * @param tp field description object
 */
function buildJoiChildren(tp: FieldDescription) {
    const primitives = ["String", "Boolean", "Number", "Array"];
    let val;
    if (primitives.includes(tp.designType.name)) {
        const typename = tp.designType.name;
        if (typename === 'String') {
            val = buildJoiString(tp);
        } else if (typename === 'Boolean') {
            val = Joi.boolean();
        } else if (typename === 'Number') {
            val = buildJoiNumber(tp);
        } else if (typename === 'Array') {
            val = buildJoiArray(tp);
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
function buildJoiRoot(tp: any): Joi.Schema {
    const metadata = getMetadata(tp);
    if (!metadata) {
        return Joi.any();
    }
    const payload: any = {}
    Object.keys(metadata).forEach(x => {
        payload[x] = buildJoiChildren(metadata[x]);
    })
    return Joi.object().keys(payload);
}

/**
 * Returns the schema for the root type 
 * @param tp type to validate 
 */
export function getSchema(tp: any): Joi.Schema{
    return buildJoiRoot(tp);
}

/**
 * Validates the object, returns the object if success, or throws a Joi Validation Error 
 * @param obj Any object
 */
export async function Validate(obj: any) {
    const cp: any = obj.constructor;
    const validator: Joi.Schema = buildJoiRoot(cp);
    return Joi.validate(obj, validator);
}
