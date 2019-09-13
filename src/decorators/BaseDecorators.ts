import 'reflect-metadata'
export const MetadataKeys = {
    Required: 'validate:is_required',
    Type: 'validate:type',
    Fields: 'validate:fields'
}
export interface Threshold{
    value:number;
    exclude?: boolean;
}
export interface FieldDescription {
    designType?: any;
    required?: boolean;
    options? : any[];
    nullable?: boolean;
    typeInfo?: any;
    email?: boolean;
    maxValue?: Threshold;
    minValue?: Threshold;
    positive?: boolean;
    negative?: boolean;
    nonempty?: boolean;
    minlength?: number;
    maxlength?: number;
}

function setFieldDescription(target: any, propertyKey: string, description: FieldDescription){
    const DesignType = Reflect.getMetadata('design:type', target, propertyKey);
    let existingFields: { [key: string]: FieldDescription } = Reflect.getMetadata(MetadataKeys.Fields, target);
    existingFields = existingFields || {};
    existingFields[propertyKey] = existingFields[propertyKey] || {};
    existingFields[propertyKey].designType = DesignType;
    existingFields[propertyKey] = {...existingFields[propertyKey], ...description};
    Reflect.defineMetadata(MetadataKeys.Fields, existingFields, target);
}

export function Required() {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {required: true};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Nullable() {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {nullable: true};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Optional() {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {required: false};
        setFieldDescription(target, propertyKey, description);
    }
}
export function ItemType(tp: any){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {typeInfo: tp};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Max(value: Threshold){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {maxValue: value};
        setFieldDescription(target, propertyKey, description);
    }
}

export function MaxLength(value: number){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {maxlength: value};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Min(value: Threshold){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {minValue: value};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Positive(){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {positive: true};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Negative(){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {negative: true};
        setFieldDescription(target, propertyKey, description);
    }
}

export function NotEmpty(){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {nonempty: true};
        setFieldDescription(target, propertyKey, description);
    }
}

export function MinLength(value: number){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {minlength: value};
        setFieldDescription(target, propertyKey, description);
    }
}

export function ValidOptions(...args: any[]) {
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {options: args};
        setFieldDescription(target, propertyKey, description);
    }
}

export function Email(){
    return function(target: any, propertyKey: string) {
        const description: FieldDescription = {email: true};
        setFieldDescription(target, propertyKey, description);
    }
}

