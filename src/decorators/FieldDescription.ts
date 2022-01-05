import { Class } from "../types";
import { ConditionSchema, SchemaArgs, Threshold } from "./BaseDecorators";

/**
 * Metadata of annotated field
 */
export interface FieldDescription {
  /**
   * Design type of the field
   */
  designType?: Class<unknown>;

  /**
   * Type of array field values
   */
  typeInfo?: Class<unknown>;

  /**
   * Conditional constraint
   */
  conditional?: ConditionSchema;

  /**
   * Custom Joi Schema
   */
  customSchema?: SchemaArgs;

  /**
   * Nullable constraint
   */
  nullable?: boolean;

  /**
   * Required constraint
   */
  required?: boolean;

  /**
   * Allowed values constraint
   */
  options?: unknown[];

  /**
   * Value greater than 0 constraint for number fields
   */
  positive?: boolean;

  /**
   * Value less than 0 constraint for number fields
   */
  negative?: boolean;

  /**
   * Min value constraint for number fields
   */
  minValue?: Threshold;

  /**
   * Max value constraint for number fields
   */
  maxValue?: Threshold;

  /**
   * Email format constraint for string fields
   */
  email?: boolean;

  /**
   * Length greater than 0 constraint for array or string fields
   */
  nonempty?: boolean;

  /**
   * Min length constraint for array and string fields
   */
  minLength?: number;

  /**
   * Max length constraint for array and string fields
   */
  maxLength?: number;

  /**
   * String field as date field mark
   */
  dateString?: boolean;

  /**
   * Date format constraint
   */
  dateStringFormat?: string;
}
