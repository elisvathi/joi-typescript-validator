
import { FieldDescription } from "../decorators/BaseDecorators";
import Joi from 'joi';
import { getMetadata } from "./MetadataHelpers";

function buildJoiString(val: any, tp: FieldDescription) {
    if (tp.nonempty) {
        tp.minlength = Math.max(tp.minlength || 0, 1);
    }
    val = Joi.string();
    if (tp.minlength) {
        val = val.min(tp.minlength);
    }
    if (tp.maxlength) {
        val = val.max(tp.maxlength);
    }
    if (tp.email) {
        val = val.email();
    }
    return val;
}

function buildJoiNumber(val: any, tp: FieldDescription) {
    val = Joi.number();
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
function buildJoiArray(val: any, tp: FieldDescription) {
    if (tp.nonempty) {
        tp.minlength = Math.max(tp.minlength || 0, 1);
    }
    val = Joi.array();
    if (tp.typeInfo) {
        val = val.items(buildJoiChilds({ designType: tp.typeInfo }));
    }
    if (tp.minlength) {
        val = val.min(tp.minlength);
    }
    if (tp.maxlength) {
        val = val.max(tp.maxlength);
    }
    return val;
}

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

function buildJoiChilds(tp: FieldDescription) {
    const primitives = ["String", "Boolean", "Number", "Array"];
    let val;
    if (primitives.includes(tp.designType.name)) {
        const typename = tp.designType.name;
        if (typename === 'String') {
            val = buildJoiString(val, tp);
        } else if (typename === 'Boolean') {
            val = Joi.boolean();
        } else if (typename === 'Number') {
            val = buildJoiNumber(val, tp);
        } else if (typename === 'Array') {
            val = buildJoiArray(val, tp);
        }
    } else {
        const payload: any = {};
        const metadata = getMetadata(tp.designType);
        Object.keys(metadata).forEach(x => {
            payload[x] = buildJoiChilds(metadata[x]);
        })
        val = Joi.object().keys(payload);
    }
    val = buildJoiGlobals(val, tp);
    return val;
}

export function buildJoiRoot(tp: any): Joi.ObjectSchema {
    const testMetadata = getMetadata(tp);
    const payload: any = {}
    Object.keys(testMetadata).forEach(x => {
        payload[x] = buildJoiChilds(testMetadata[x]);
    })
    return Joi.object().keys(payload);
}

export async function Validate(obj: any) {
    const cp: any = obj.constructor;
    const validator: Joi.ObjectSchema = buildJoiRoot(cp);
    return Joi.validate(obj, validator);
}
