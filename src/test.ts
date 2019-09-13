import 'reflect-metadata'
import { Required, Optional, ValidOptions, Nullable, ItemType, MinLength, MaxLength, Max, Min, Email } from "./decorators/BaseDecorators";
import { Validate } from './utils/BuilderUtils';

class TestChild {
    @Optional()
    id: string;
}
class User{

    @Required()
    @Email()
    public email: string;

    @Required()
    @MaxLength(30)
    @MinLength(5)
    public username: string;

    @Required()
    @MaxLength(30)
    @MinLength(5)
    public password: string;

    @Optional()
    @Min({value: 18})
    @Max({value: 30, exclude: true})
    public age: number;
}

class Test {

    @Optional()
    name: string;

    @ValidOptions(1, 2, 3, 4, 5, 15)
    @Optional()
    age: number;

    @Required()
    @ValidOptions('Thrive', 'Voluum')
    type: string;

    @Required()
    @MinLength(2)
    @MaxLength(7)
    @Email()
    value: string;

    @Required()
    @Max({value: 3, exclude: true})
    @Min({value: 1})
    numberValue: number;

    @Optional()
    valid: true;

    @Required()
    @Nullable()
    child: TestChild | null;

    @Optional()
    @ItemType(TestChild)
    data: Array<TestChild>;

}

const t = new Test();
t.type = "Thrive";
t.age = 15;
t.child = null;
const tc = new TestChild();
tc.id = "Hello";
const tc2 = new TestChild();
t.data = [tc, tc2];
t.value = 'a@a.a';
t.numberValue = 1;
// t.data = [1];
// printMetadata(t)
// console.log(Validate(t));
Validate(t).then((r)=>{
    console.log("VALID:", r);
}).catch(err=>console.error("INVALID:", err.message));
