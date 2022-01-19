import chai from "chai";

import { Validate } from "../../src";
import { Class } from "../../src/types";

declare global {
  namespace Chai {
    interface Assertion {
      valid: Assertion;
    }
  }
}

chai.use(function (__chai, utils) {
  __chai.Assertion.addProperty("valid", function () {
    const obj = this._obj as object;
    const klass = obj.constructor as Class<object>;

    new __chai.Assertion(Validate(klass, obj).error === undefined)
      .to
      .equal(utils.flag(this, "negate") === undefined);
  });
});
