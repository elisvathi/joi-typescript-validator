import BaseJoi, { any } from 'joi';
import { getMetadata, getOptions } from '../MetadataHelpers';
import { FieldDescription } from '../../decorators/FieldDescription';
import { buildJoiChildren } from './buildJoiChildren';
import { Joi } from '../BuilderUtils';
import { idMap, VisitedMap } from './buildJoiRoot';

/**
 * Returns Joi schema for a non-primitive or array object
 * @param tp Field description metadata
 */

export function buildJoiObject(tp: FieldDescription, visited: VisitedMap, sharedCollector: Array<BaseJoi.Schema> ) {
  const metadata = getMetadata(tp.designType);
  if (!metadata) {
    let anySchema = Joi.any();
    const id = idMap.get(tp.designType);
    if (id) {
      anySchema = anySchema.id(id);
    }
    return anySchema;
  }
  const payload = Object.keys(metadata).reduce(
    (acc, item) => ({
      ...acc,
      [item]: buildJoiChildren(metadata[item], visited, sharedCollector),
    }),
    {}
  );
  let result = Joi.object().keys(payload);
  const options = getOptions(tp.designType);
  if (options) {
    result = result.options(options);
  }
  return result;
}
