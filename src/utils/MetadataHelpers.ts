import { MetadataKeys } from "../decorators/BaseDecorators";
import 'reflect-metadata'

/**
 * Print class saved metadata 
 * @param obj Class 
 */
export function printMetadata(obj: any) {
    const metadata = Reflect.getMetadata(MetadataKeys.Fields, obj);
    console.log(metadata);
}

/**
 * Return type metadata 
 * TODO: Get metadata without needing to instantiate the object
 * @param obj 
 */
export function getMetadata(obj: any) {
    const tp = new obj();
    return Reflect.getMetadata(MetadataKeys.Fields, tp);
}

