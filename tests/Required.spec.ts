import { expect } from 'chai';
import { Optional, Required } from '../src/decorators/BaseDecorators';
import { Validate } from '../src/utils/BuilderUtils';
import { Class } from '../src';

class ClassWithRequiredField {
  @Required()
  public name: string;
}

// tslint:disable-next-line: max-classes-per-file
class RequiredOverridenByOptional {
  @Optional()
  @Required()
  public name: string;
}

// tslint:disable-next-line: max-classes-per-file
class BaseWithRequired {
  @Required()
  public nameField: string;
  @Optional()
  public id: number;
}

// tslint:disable-next-line: max-classes-per-file
class DerivedWithOptional extends BaseWithRequired {
  @Optional()
  public nameField: string;
}

// tslint:disable-next-line: max-classes-per-file
class D2 extends BaseWithRequired {}

async function checkIfValid<T>(clazz: Class<T>, instance: any) {
  const error = await Validate(clazz, instance).error;
  return !error;
}

describe('Simple required tests', () => {
  it('Should throw if required field not enabled', async () => {
    const instance: ClassWithRequiredField = new ClassWithRequiredField();
    const value = await checkIfValid(ClassWithRequiredField, instance);
    expect(value).to.equal(false);
  });
  it('Should pass if required is satisfied', async () => {
    const instance: ClassWithRequiredField = new ClassWithRequiredField();
    instance.name = 'User';
    const valid = await checkIfValid(ClassWithRequiredField, instance);
    expect(valid).to.equal(true);
  });
  it('Should override required by optional on same class', async () => {
    const instance = new RequiredOverridenByOptional();
    const valid = await checkIfValid(RequiredOverridenByOptional, instance);
    expect(valid).to.equal(true);
  });
  it('Should override in the derived class', async () => {
    const instance = new DerivedWithOptional();
    const valid = await checkIfValid(DerivedWithOptional, instance);
    expect(valid).to.equal(true);
  });
  it('Should should keep base class validation if not overridden', async () => {
    const instance = new D2();
    const valid = await checkIfValid(D2, instance);
    expect(valid).to.equal(false);
  });
});
