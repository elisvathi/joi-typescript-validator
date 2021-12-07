import { ValidationOptions } from "joi";
import "reflect-metadata";
import { MetadataKeys } from "..";
import { SchemaArgs, TreeMetadata } from "../decorators/BaseDecorators";
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
 * Extracts metadata for a particular object, aware if that object extends another objects,
 * an joins the metadata properties accordingly ,
 * Method checks recursively through the same object to find super-class metadata
 * @param obj Object class to extract metadata for
 * @param treeMetadata  Metadata registered with Reflect
 */
function getMetadataFromObject(obj: any, treeMetadata: TreeMetadata) {
  /**
   * Current class name
   */
  const name = obj;
  /**
   * Get prototype an prototype name of the class
   * to check if it extends from another class
   */
  const proto = Object.getPrototypeOf(obj);
  const protoName = proto.name;
  /**
   * Current class metadata
   * WIll override if necessary the super class metadata
   */
  const existingObject = treeMetadata.get(name) || {};
  if (!!protoName && protoName !== "Object") {
    const existingFields = existingObject.fields || {};
    let superMetadata = getMetadataFromObject(proto, treeMetadata);
    superMetadata = { ...superMetadata };
    Object.keys(existingFields).forEach((x) => {
      if (!superMetadata[x]) {
        /**
         * If a property exist on the current class but not on the super class
         * insert the property
         */
        superMetadata[x] = existingFields[x];
      } else {
        /**
         * Override the super class metadata for that field with the latest class field metadata
         */
        superMetadata[x] = { ...superMetadata[x], ...existingFields[x] };
      }
    });
    return superMetadata;
  } else {
    return existingObject.fields || {};
  }
}

/**
 * Return type metadata
 * @param obj
 */
export function getMetadata(obj: any) {
  /**
   * Gets the metadata for the current class,
   * Returns a key value object with all base classes and inheriting classes
   */
  const retVal = Reflect.getMetadata(MetadataKeys.Fields, obj.prototype);
  if (!retVal) {
    return;
  }
  return getMetadataFromObject(obj, retVal);
}

export function getOptions(obj: any): ValidationOptions {
  const retVal = Reflect.getMetadata(MetadataKeys.Fields, obj.prototype);
  if (!retVal) {
    return;
  }
  if (!obj.name) {
    return;
  }
  let selected = retVal.get(obj);
  if (!selected) {
    const result = getOptions(Object.getPrototypeOf(obj));
    return result;
  }
  return selected.options;
}

export function getGlobalArgs(obj: any): SchemaArgs {
  const retVal = Reflect.getMetadata(MetadataKeys.Fields, obj.prototype);
  if (!retVal) {
    return;
  }
  if (!obj.name) {
    return;
  }
  const selected = retVal.get(obj);
  if (!selected) {
    const result = getGlobalArgs(Object.getPrototypeOf(obj));
    return result;
  }
  return selected.globalArgs;
}
