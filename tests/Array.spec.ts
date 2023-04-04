import { expect } from 'chai';
import { ItemType, Optional, SchemaOptions, Validate } from '../src';

@SchemaOptions({ allowUnknown: true })
class B {
  @Optional()
  id: string;
}

@SchemaOptions({ allowUnknown: false })
class C {
  @Optional()
  id: string;
}

class A {
  @ItemType(B)
  @Optional()
  items: B[];

  @ItemType(C)
  @Optional()
  items_c: C[];
}

describe('Array item schema options', () => {
  it('Should allow unknown', () => {
    const r = { items: [{ id: 'abc', abc: 123 }] };
    expect(Validate(A, r as any).error).to.be.undefined;
  });

  it('Should not allow unknown', () => {
    const r2 = { items_c: [{ id: 'abc', abc: 123 }] };
    expect(Validate(A, r2 as any).error).to.exist;
  });
});

describe('Item schema is valid', () => {
  it('Should fail when incorrect type on child item', () => {
    const r2 = { items_c: [{ id: 123 }] };
    expect(Validate(A, r2 as any).error).to.exist;
  });
});
