import BaseJoi from 'joi';
import { FieldDescription, DescKey } from '../../decorators/FieldDescription';
import { buildJoiRoot, VisitedMap, recursiveReference } from './buildJoiRoot';
import { Joi } from '../BuilderUtils';
import { buildJoiString } from './buildJoiString';
import { buildJoiDate } from './buildJoiDate';
import { buildJoiNumber } from './buildJoiNumber';
import { buildJoiArray } from './buildJoiArray';
import { buildJoiGlobals } from './buildJoiGlobals';
import { buildJoiObject } from './buildJoiObject';

/**
 * Build field schema depending on type
 * @param {FieldDescription} description Field description object
 * @returns {BaseJoi.Schema}
 */
function buildFieldSchema(
  description: FieldDescription,
  visited: VisitedMap,
  sharedCollector: Array<BaseJoi.Schema> = []
): BaseJoi.Schema {
  const designType = description.dateString
    ? 'Date'
    : description.designType?.name;

  switch (designType) {
    case 'Array':
      return buildJoiArray(description, visited, sharedCollector);
    case 'Date':
      return buildJoiDate(description);
    case 'Boolean':
      return Joi.boolean();
    case 'Number':
      return buildJoiNumber(description);
    case 'String':
      return buildJoiString(description);
    default:
      const id = recursiveReference(description.designType);
      sharedCollector.push(
        buildJoiObject(description, visited, sharedCollector).id(id)
      );
      return Joi.link(`#${id}`);
  }
}

/**
 * Checks the type of the field and returns the child schema accordingly
 * @param tp field description object
 */
export function buildJoiChildren(
  tp: FieldDescription,
  visited: VisitedMap,
  sharedCollector: Array<BaseJoi.Schema>
) {
  let val: any;
  if (tp.union && tp.union.length > 0) {
    val = Joi.alternatives(
      tp.union.map((x) => {
        if (typeof x !== 'function') {
          return x;
        }
        return buildJoiRoot(x, visited, sharedCollector);
      })
    );
  } else {
    val = buildFieldSchema(tp, visited, sharedCollector);
  }
  val = buildJoiGlobals(val, tp);
  return val;
}
