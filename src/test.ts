import 'reflect-metadata';
import { Validate } from '.';
//@ts-ignore
import convert from 'joi-to-json';
import {
  Optional,
  Required,
  SchemaOptions,
  Max,
  MinLength,
  Union,
  ValidOptions,
  CustomSchema,
} from './decorators/BaseDecorators';
// import { getMetadata } from './utils/MetadataHelpers';
import Joi from 'joi';
import { getSchema, getJsonSchema } from './utils/BuilderUtils';

class FirstClass {
  @Required()
  first_name!: string;
}

class SecondClass {
  @Required()
  email!: string;
}
@SchemaOptions({ allowUnknown: true })
class Test {
  data!: string;
  @Optional()
  @MinLength(3, 'Min length')
  items!: number[];
  @Required('This is required')
  @Max(3, 'The maximum must be 3')
  something!: number;
  @Union(FirstClass, SecondClass)
  @Required()
  extra!: FirstClass | SecondClass;
}

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gte'
  | 'gt'
  | 'lte'
  | 'lt'
  | 'in'
  | 'exists'
  | 'not_null';

export class FlowCondition {
  @Required()
  key!: string;
  @Required()
  value!: string;
  @Required()
  @ValidOptions([
    'eq',
    'neq',
    'gte',
    'gt',
    'lte',
    'lt',
    'in',
    'exists',
    'not_null',
  ])
  operator!: ConditionOperator;
}
export type Condition = FlowCondition | ConditionTree;

export class ConditionTree {
  @ValidOptions(['and', 'or'])
  operator!: 'and' | 'or';
  @Union(FlowCondition, ConditionTree)
  @Required()
  left!: Condition;
  @Union(FlowCondition, ConditionTree)
  @Required()
  right!: Condition;
  @Union(FlowCondition, ConditionTree)
  @Required()
  mid!: Condition;
}
class KV {
  @Required()
  name!: string;
  @Required()
  value!: string;
}
export class TestTest {
  @CustomSchema(((j: Joi.ArraySchema) =>
    j
      .min(1)
      .items(
        Joi.object().keys({
          name: Joi.string().required(), // TODO specify items type. Ex. campaign,offer,lander
          value: Joi.string().required(),
        })
      )
      .optional()) as any)
  data!: any[];
}

async function main(): Promise<void> {
  const t = {
    operator: 'and',
    left: { key: 'a', operator: 'eq', value: 'a' },
    right: {
      operator: 'or',
      left: { key: 'a', operator: 'eq', value: 'a' },
      right: { key: 'a', operator: 'neq', value: 'a' },
    },
  };
  const schema = getJsonSchema(ConditionTree);
  console.log(JSON.stringify(schema));
  // console.dir(JSON.stri, { depth: null });
}

main().catch(console.log);
