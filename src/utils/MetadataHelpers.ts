import { MetadataKeys } from "../decorators/BaseDecorators";
import 'reflect-metadata'

export function printMetadata(obj: any) {
    const metadata = Reflect.getMetadata(MetadataKeys.Fields, obj);
    console.log(metadata);
}

export function getMetadata(obj: any) {
    const tp = new obj();
    return Reflect.getMetadata(MetadataKeys.Fields, tp);
}

