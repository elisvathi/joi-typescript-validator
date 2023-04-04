import { FieldDescription, DescKey } from '../../decorators/FieldDescription';
import { Joi } from '../BuilderUtils';

export function buildJoiDate(tp: FieldDescription) {
  let val = Joi.date();
  if (tp[DescKey.DATE_STRING]) {
    if (tp.dateStringFormat) {
      val = val.format(tp.dateStringFormat);
    }
  }
  return val;
}
