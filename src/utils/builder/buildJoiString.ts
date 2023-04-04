import { FieldDescription, DescKey } from '../../decorators/FieldDescription';
import { Joi, setError } from '../BuilderUtils';

export function buildJoiString(tp: FieldDescription) {
  if (tp[DescKey.NON_EMPTY]) {
    tp[DescKey.MIN_LENGTH] = Math.max(tp[DescKey.MIN_LENGTH] || 0, 1);
  }
  let val = Joi.string();
  if (tp[DescKey.DATE_STRING]) {
    val = Joi.date();
    val = setError(val, DescKey.MIN_LENGTH, tp);
    if (tp.dateStringFormat) {
      val = val.format(tp.dateStringFormat);
    }
  }
  if (tp[DescKey.MIN_LENGTH]) {
    val = val.min(tp[DescKey.MIN_LENGTH]);
    val = setError(val, DescKey.MIN_LENGTH, tp);
  }
  if (tp[DescKey.MAX_LENGTH]) {
    val = val.max(tp[DescKey.MAX_LENGTH]);
    val = setError(val, DescKey.MAX_LENGTH, tp);
  }
  if (tp[DescKey.EMAIL] && !tp[DescKey.DATE_STRING]) {
    val = val.email();
    val = setError(val, DescKey.EMAIL, tp);
  }
  return val;
}
