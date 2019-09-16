import "reflect-metadata";
import { Email,
         ItemType,
         Max,
         MaxLength,
         Min,
         MinLength,
         Nullable,
         Optional,
         Required,
    ValidOptions,
    DateString} from "./decorators/BaseDecorators";
import { Validate } from "./utils/BuilderUtils";

class TestChild {
    @Optional()
    public id: string;
}
// tslint:disable-next-line: max-classes-per-file
class Test {

    @Optional()
    public name: string;

    @ValidOptions(1, 2, 3, 4, 5, 15)
    @Optional()
    public age: number;

    @Required()
    @ValidOptions("user1", "user2")
    public type: string;

    @Required()
    @MinLength(2)
    @MaxLength(7)
    @Email()
    public value: string;

    @Required()
    @Max({value: 3, exclude: true})
    @Min({value: 1})
    public numberValue: number;

    @Optional()
    public valid: true;

    @Required()
    @Nullable()
    public child: TestChild | null;

    @Optional()
    @ItemType(TestChild)
    public data: TestChild[];

    @Required()
    @DateString()
    public date: Date;

}
// tslint:disable-next-line: max-classes-per-file
class Undecorated {
    public user: string;
}
const t = new Test();
t.type = "user1";
t.age = 15;
t.child = null;
const tc = new TestChild();
tc.id = "Hello";
const tc2 = new TestChild();
t.data = [tc, tc2];
t.value = "a@a.a";
(t as any).date = "2019-09-21";
t.numberValue = 1;
Validate(t, true).then((r) => {
    console.log("VALID:", r);
}).catch((err) => console.error("INVALID:", err.message));
Validate(t, true).then((r) => {
    console.log("VALID:", r);
}).catch((err) => console.error("INVALID:", err.message));
// printMetadata(T2);
