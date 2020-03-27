import joi from 'joi';
import "reflect-metadata";
import { getSchema } from ".";
import { ItemType, Optional, SchemaOptions } from "./decorators/BaseDecorators";

@SchemaOptions({allowUnknown: true})
class Test{
    @Optional()
    data: string;
    @Optional()
    @ItemType(String)
    items: number[];
}
async function main(){
    const t = {data: "test", test: false, items: ["st", "a"]};
    const schema = getSchema(Test);
    const result = await joi.validate(t, schema);
    console.log("Result", result);
}

main().catch(console.log);
