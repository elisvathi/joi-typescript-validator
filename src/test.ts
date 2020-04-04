import "reflect-metadata";
import { Validate } from ".";
import { Optional, Required, SchemaOptions } from "./decorators/BaseDecorators";

@SchemaOptions({allowUnknown: true})
class Test{
    @Optional()
    data: string;
    @Optional()
    items: number[];
    @Required()
    something: number;
}
async function main(){
    const t = {data: "test", test: false, items: ["st", "a"], something: '12'};
    const validated = await Validate(Test, t);
    console.log(validated);
}

main().catch(console.log);
