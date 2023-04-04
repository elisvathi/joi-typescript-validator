import BaseJoi, { Schema } from 'joi';
import {
  FieldDescription,
  DescKey,
  Class,
} from '../decorators/FieldDescription';
import { buildJoiRoot } from './builder/buildJoiRoot';
import JoiDateFactory from '@joi/date';
import convert from 'joi-to-json'
export const Joi = BaseJoi.extend(JoiDateFactory);
/**
 * Builds the schema for the string field
 * @param tp Field description metadata
 */

// const savedSchemas: { [key: string]: BaseJoi.Schema } = {};
const savedSchemas: Map<any, BaseJoi.Schema> = new Map<any, BaseJoi.Schema>();

export function setError(val: any, key: DescKey, tp: FieldDescription) {
  if (tp.messages && tp.messages.get(key)) {
    const message = tp.messages.get(key);
    val = val.error(new Error(`[${tp.name}]: ${message}`));
  }
  return val;
}

/**
 * Returns Joi schema for the given class
 * @template T
 * @param {Class<T>} klass             Class for which to get or build the schema
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Schema} Joi Schema
 */
export function getSchema<T>(
  klass: Class<T>,
  shouldSave = true
): BaseJoi.Schema {
  const schema = savedSchemas.get(klass) || buildJoiRoot(klass);

  if (shouldSave) {
    savedSchemas.set(klass, schema);
  }

  return schema;
}

export function getJsonSchema<T>(klass: Class<T>, shouldSave = true): any{
  const schema = getSchema(klass);
  return convert(schema);
}

/**
 * Returns a plain object representing the schema's rules and properties for the given class
 * @template T
 * @param {Class<T>} klass             Class for which to get the schema's rules and properties
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.Description} Joi schema's rules and properties
 */
export function getSchemaDescription<T>(klass: Class<T>, shouldSave = true) {
  return getSchema(klass, shouldSave).describe();
}

/**
 * Validates the class instance object and returns Joi validation result
 * @template T
 * @param {Class<T>} klass             Class of object
 * @param {object}   instance          Class instance object
 * @param {boolean}  [shouldSave=true] Boolean flag to choose whether or not to save the schema
 * @returns {BaseJoi.ValidationResult} Joi ValidationResult
 */
export function Validate<T extends object>(
  klass: Class<T>,
  instance: T,
  shouldSave = true
) {
  return getSchema(klass, shouldSave).validate(instance);
}

export function getId(sc: Schema): string {
  throw new Error('Not implemented!');
}
