import { Optional, Required, SchemaOptions, Union, ValidOptions } from '../src';

import { expect } from 'chai';
import { Validate } from '../src/utils/BuilderUtils';
import { ItemType } from '../src/decorators/BaseDecorators';

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
  key: string;
  @Required()
  value: any;
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
  operator: ConditionOperator;
}
export type Condition = FlowCondition | ConditionTree;

export class ConditionTree {
  @ValidOptions(['and', 'or'])
  operator: 'and' | 'or';
  @Union(FlowCondition, ConditionTree)
  @Required()
  left: Condition;
  @Union(FlowCondition, ConditionTree)
  @Required()
  right: Condition;
}
describe('Test recursive result simple case', () => {
  const first = new FlowCondition();
  first.key = 'a';
  first.value = 'b';
  first.operator = 'exists';

  const second = new FlowCondition();
  second.key = 'a';
  second.value = 'b';
  second.operator = 'exists';
  const compound = new ConditionTree();
  compound.operator = 'or';
  compound.left = first;
  compound.right = second;
  it('Should validate simple object', () => {
    expect(Validate(FlowCondition, first).error).to.be.undefined;
  });
  it('Should validate tree of 1 level', () => {
    expect(Validate(ConditionTree, compound).error).to.be.undefined;
  });
});
