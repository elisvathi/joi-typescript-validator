import { ConditionSchema, SchemaArgs, Threshold } from "./BaseDecorators";
export enum DescKey {
    REQUIRED = "required",
    NULLABLE = "nullable",
    TYPE_INFO = "typeInfo",
    EMAIL = "email",
    MAX_VALUE = "maxValue",
    MIN_VALUE = "minValue",
    POSITIVE = "positive",
    NEGATIVE = "negative",
    NON_EMPTY = "nonempty",
    MIN_LENGTH = "minLength",
    MAX_LENGTH = "maxLength",
    DATE_STRING = "dateString",
}
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
    [DescKey.REQUIRED]?: boolean;
    /**
     * Constraint field content on the instance to one of these values if specified
     */
    options?: any[];
    /**
     *  The field can contain null value
     */
    [DescKey.NULLABLE]?: boolean;
    /**
     *  Type specified if the field is an array
     */
    [DescKey.TYPE_INFO]?: any;
    /**
     *  Flag if the string field should be an email
     */
    [DescKey.EMAIL]?: boolean;
    /**
     *  Max value for number fields
     */
    [DescKey.MAX_VALUE]?: Threshold;
    /**
     *  Min Value for number fields
     */
    [DescKey.MIN_VALUE]?: Threshold;
    /**
     *  Specifies if number should be positive
     */
    [DescKey.POSITIVE]?: boolean;
    /**
     *  Specifies if number should be negative
     */
    [DescKey.NEGATIVE]?: boolean;
    /**
     *  Specifies if string or array field should be non-empty,
     *  changes the minLength value to the max of 1 and existing minlength
     */
    [DescKey.NON_EMPTY]?: boolean;
    /**
     *  Min length for array and string values
     */
    [DescKey.MIN_LENGTH]?: number;
    /**
     *  Max length for array and string values
     */
    [DescKey.MAX_LENGTH]?: number;
    [DescKey.DATE_STRING]?: boolean;
    dateStringFormat?: string;
}
