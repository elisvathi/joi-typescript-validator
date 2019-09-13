import { expect } from 'chai';
import { Required, Optional } from '../src/decorators/BaseDecorators'
import { Validate } from '../src/utils/BuilderUtils'

class ClassWithRequiredField {
    @Required()
    public name: string;
}

class RequiredOverridenByOptional {
    @Optional()
    @Required()
    public name: string;
}

class BaseWithRequired{
    @Required()
    public name: string;
}

class DerivedWithOptional extends BaseWithRequired{
    @Required()
    public name: string;
}

class D2 extends BaseWithRequired{
}

async function checkIfValid(instance){
    try {
        await Validate(instance);
    }catch(err){
        return false;
    }
    return true;
}
describe('Simple required tests', () => {
    it('Should throw if required field not enabled', async () => {
        const instance: ClassWithRequiredField = new ClassWithRequiredField();
        const value =  await checkIfValid(instance);
        expect(value).to.equal(false);
    });
    it('Should pass if required is satisfied', async () => {
        const instance: ClassWithRequiredField = new ClassWithRequiredField();
        instance.name = "User"
        const valid = await checkIfValid(instance);
        expect(valid).to.equal(true);
    });
    it("Should override required by optional on same class", async ()=>{
        const instance = new RequiredOverridenByOptional();
        const valid = await checkIfValid(instance);
        expect(valid).to.equal(true);
    });
    it("Should override in the derived class", async ()=>{
        const instance = new DerivedWithOptional();
        const valid = await checkIfValid(instance);
        expect(valid).to.equal(false);
    });
    it("Should should keep base class validation if not overridden", async ()=>{
        const instance = new D2();
        const valid = await checkIfValid(instance);
        expect(valid).to.equal(false);
    });
});
