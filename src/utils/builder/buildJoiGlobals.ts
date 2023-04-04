import BaseJoi from 'joi';
import { getGlobalArgs } from '../MetadataHelpers';
import { FieldDescription } from '../../decorators/FieldDescription';

/**
 * Builds the existing schema with global conditions for all types
 * @param val existing JOI schema
 * @param tp   Field description metadata
 */

export function buildJoiGlobals(
  fieldSchema: BaseJoi.Schema,
  description: FieldDescription
) {
  let schema: BaseJoi.Schema | BaseJoi.Schema[] = fieldSchema;

  if (description.nullable) {
    schema = schema.allow(null);
  }

  if (description.options) {
    schema = schema.valid(...description.options);
  }

  if (description.required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (description.customSchema) {
    if (typeof description.customSchema === 'function') {
      schema = description.customSchema(schema);
    } else {
      schema = description.customSchema;
    }
  }

  const globals = getGlobalArgs(description.designType);
  if (globals) {
    if (typeof globals === 'function' && !Array.isArray(schema)) {
      schema = globals(schema);
    } else if (typeof globals !== 'function') {
      schema = globals;
    }
  }

  return schema;
}
