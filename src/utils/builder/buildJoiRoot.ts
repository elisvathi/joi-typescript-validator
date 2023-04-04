import BaseJoi from 'joi';
import { Class, SchemaFunction } from '../..';
import { getMetadata, getOptions, getGlobalArgs } from '../MetadataHelpers';
import { getId, Joi } from '../BuilderUtils';
import { buildJoiChildren } from './buildJoiChildren';

export let incremental_id_value = 0;
export type VisitedMap = Map<any, BaseJoi.Schema | null>;
export const idMap: Map<any, string> = new Map();

export function recursiveReference<T>(tp: Class<T>): string {
  let currentId = idMap.get(tp);
  if (!currentId) {
    currentId = `reference_${incremental_id_value++}`;
    idMap.set(tp, currentId);
  }
  return currentId;
}

/**
 * Returns the schema for the root type
 * @param tp type to validate
 */
export function buildJoiRoot<T>(
  tp: Class<T>,
  visited?: VisitedMap,
  sharedCollector: Array<BaseJoi.Schema> | undefined = undefined
) {
  if (!visited) {
    visited = new Map();
  }
  if (visited.has(tp)) {
    const id = recursiveReference(tp);
    return Joi.link(`#${id}`);
  }
  visited.set(tp, null);

  const metadata = getMetadata(tp) || {};
  const rootId = recursiveReference(tp);
  let objectSchema = BaseJoi.object().id(rootId);
  const sharedSchemas = sharedCollector || [];
  const partialSchema = Object.keys(metadata).reduce(
    (acc, item) => ({
      ...acc,
      [item]: buildJoiChildren(
        metadata[item],
        visited as VisitedMap,
        sharedSchemas
      ),
    }),
    {}
  );
  objectSchema = objectSchema.keys(partialSchema);
  if (!sharedCollector) {
    for (const item of sharedSchemas) {
      objectSchema = objectSchema.shared(item);
    }
  }

  const options = getOptions(tp);
  const globals = getGlobalArgs(tp);

  let schema: BaseJoi.Schema = options
    ? objectSchema.options(options)
    : objectSchema;
  if (globals) {
    if (typeof globals === 'function') {
      const result = globals(schema);
      if (!Array.isArray(result)) {
        schema = result;
      }
    }
    schema = globals as any;
  }
  return schema;
}
