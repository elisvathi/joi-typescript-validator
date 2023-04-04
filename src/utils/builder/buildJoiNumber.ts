import { FieldDescription, DescKey } from '../../decorators/FieldDescription';
import { Joi, setError } from '../BuilderUtils';

/**
 * Builds the schema for the number field
 * @param tp Field description metadata
 */

export function buildJoiNumber(tp: FieldDescription) {
  let val = Joi.number();
  if (tp[DescKey.MIN_VALUE]) {
    val = val.min(tp[DescKey.MIN_VALUE].value);
    if (tp[DescKey.MIN_VALUE].exclude) {
      val = val.invalid(tp[DescKey.MIN_VALUE].value);
    }
    val = setError(val, DescKey.MIN_VALUE, tp);
  }
  if (tp[DescKey.MAX_VALUE]) {
    val = val.max(tp[DescKey.MAX_VALUE].value);
    if (tp[DescKey.MAX_VALUE].exclude) {
      val = val.invalid(tp[DescKey.MAX_VALUE].value);
    }
    val = setError(val, DescKey.MAX_VALUE, tp);
  }
  if (tp[DescKey.POSITIVE]) {
    val = val.positive();
    val = setError(val, DescKey.POSITIVE, tp);
  }
  if (tp[DescKey.NEGATIVE]) {
    val = val.negative();
    val = setError(val, DescKey.NEGATIVE, tp);
  }
  return val;
}
