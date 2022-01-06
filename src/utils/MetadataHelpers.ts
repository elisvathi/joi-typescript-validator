import "reflect-metadata";
import { ValidationOptions } from "joi";

import { MetadataKeys } from "..";
import { FieldsMap, SchemaArgs, TreeMetadata } from "../decorators/BaseDecorators";
import { Class } from "../types";

/**
 * Print class metadata to console
 * @template T
 * @param {Class<T>} klass Class for which to print metadata
 */
export function printMetadata<T>(klass: Class<T>) {
  console.dir(getMetadata(klass), { depth: null });
}

/**
 * Extract fields metadata from class, taking into account parent classes.
 * Recursevly get the metadata from class parents and merge them accordingly.
 * @template T
 * @param {Class<T>} klass Class, for which, to get the fields metadata
 * @param {TreeMetadata} metadata Metadata attached with reflect-metadata
 * @returns {FieldsMap}
 */
function extractClassMetadata<T>(klass: Class<T>, metadata: TreeMetadata): FieldsMap {
  const classDescription = metadata.get(klass) || {};
  const fields = classDescription.fields || {};

  const parentClass = Object.getPrototypeOf(klass) as Class<unknown>;
  if (parentClass.name !== "") {
    return { ...extractClassMetadata(parentClass, metadata), ...fields };
  }

  return fields;
}

/**
 * Get class fields metadata
 * @template T
 * @param {Class<T>} klass Class, for which, to get the fields metadata
 * @returns {FieldsMap}
 */
export function getMetadata<T>(klass: Class<T>) {
  const metadata = Reflect.getMetadata(MetadataKeys.Fields, klass.prototype) as TreeMetadata;
  if (metadata === undefined) {
    return;
  }

  return extractClassMetadata(klass, metadata);
}

/**
 * Get ValidationOptions passed to class with `@SchemaOptions` decorator
 * @template T
 * @param {Class<T>} klass Class for which to get the schema options passed by decorator
 * @returns {ValidationOptions} Joi ValidationOptions
 */
export function getOptions<T>(klass: Class<T>): ValidationOptions {
  const metadata = Reflect.getMetadata(MetadataKeys.Fields, klass.prototype) as TreeMetadata;
  if (metadata === undefined) {
    return;
  }

  const classDescription = metadata.get(klass);
  if (classDescription === undefined) {
    const parentClass = Object.getPrototypeOf(klass) as Class<unknown>;
    if (parentClass.name !== "") {
      return getOptions(parentClass);
    }
  }

  return classDescription.options;
}

/**
 * Get SchemaArgs passed to class with `@CustomSchema` decorator
 * @template T
 * @param {Class<T>} klass Class for which to get the custom Joi schema or schema function passed by decorator
 * @returns {SchemaArgs} Joi schema or schema function
 */
export function getGlobalArgs<T>(klass: Class<T>): SchemaArgs {
  const metadata = Reflect.getMetadata(MetadataKeys.Fields, klass.prototype) as TreeMetadata;
  if (metadata === undefined) {
    return;
  }

  const classDescription = metadata.get(klass);
  if (classDescription === undefined) {
    const parentClass = Object.getPrototypeOf(klass) as Class<unknown>;
    if (parentClass.name !== "") {
      return getGlobalArgs(parentClass);
    }
  }

  return classDescription.globalArgs;
}
