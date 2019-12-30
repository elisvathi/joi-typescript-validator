import { ConditionSchema, SchemaArgs, Threshold } from "./BaseDecorators";
/**
 *  Metadata used for all annotated fields
 */
export interface FieldDescription {
    conditional?: ConditionSchema;
    customSchema?: SchemaArgs;
    /**
     * Design type of the field
     */
    designType?: any;
    /**
     * Required flag
     */
    required?: boolean;
    /**
     * Constraint field content on the instance to one of these values if specified
     */
    options?: any[];
    /**
     *  The field can contain null value
     */
    nullable?: boolean;
    /**
     *  Type specified if the field is an array
     */
    typeInfo?: any;
    /**
     *  Flag if the string field should be an email
     */
    email?: boolean;
    /**
     *  Max value for number fields
     */
    maxValue?: Threshold;
    /**
     *  Min Value for number fields
     */
    minValue?: Threshold;
    /**
     *  Specifies if number should be positive
     */
    positive?: boolean;
    /**
     *  Specifies if number should be negative
     */
    negative?: boolean;
    /**
     *  Specifies if string or array field should be non-empty,
     *  changes the minLength value to the max of 1 and existing minlength
     */
    nonempty?: boolean;
    /**
     *  Min length for array and string values
     */
    minLength?: number;
    /**
     *  Max length for array and string values
     */
    maxLength?: number;
    dateString?: boolean;
    dateStringFormat?: string;
}
