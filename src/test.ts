import "reflect-metadata";
import { getSchema, Validate } from ".";
import { Optional, Required, SchemaOptions } from "./decorators/BaseDecorators";

@SchemaOptions({ allowUnknown: true })
class Test {
  @Optional()
  data: string;
  @Optional()
  items: number[];
  @Required()
  something: number;
}

async function main() {
  getSchema(Object);
  console.log("Object schema ok!");
  getSchema(String);
  console.log("String schema ok!");
  getSchema(Boolean);
  console.log("Boolean schema ok!");
  getSchema(Date);
  console.log("Date schema ok!");
  getSchema(Number);
  console.log("Number schema ok!");
  getSchema(Test);
  console.log("Test schema ok!");
}

main().catch(console.log);
