import BaseJoi from 'joi';
import { FieldDescription, DescKey } from '../../decorators/FieldDescription';
import { buildJoiChildren } from './buildJoiChildren';
import { Joi, setError } from '../BuilderUtils';
import { VisitedMap } from './buildJoiRoot';

/**
 * Builds a Joi array schema
 * @param tp Field description metadata
 */

export function buildJoiArray(
  tp: FieldDescription,
  visited: VisitedMap,
  sharedCollector: Array<BaseJoi.Schema>
) {
  if (tp[DescKey.NON_EMPTY]) {
    tp[DescKey.MIN_LENGTH] = Math.max(tp[DescKey.MIN_LENGTH] || 0, 1);
  }
  let val = Joi.array();
  if (tp[DescKey.TYPE_INFO]) {
    val = val.items(
      buildJoiChildren(
        { designType: tp[DescKey.TYPE_INFO] },
        visited,
        sharedCollector
      )
    );
  } else {
    val = val.items(Joi.any());
  }
  if (tp[DescKey.MIN_LENGTH]) {
    val = val.min(tp[DescKey.MIN_LENGTH]);
    val = setError(val, DescKey.MIN_LENGTH, tp);
  }
  if (tp[DescKey.MAX_LENGTH]) {
    val = val.max(tp[DescKey.MAX_LENGTH]);
    val = setError(val, DescKey.MAX_LENGTH, tp);
  }
  return val;
}
