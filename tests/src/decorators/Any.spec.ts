import { expect } from "../../helpers";

import Joi from "joi";
import { CustomSchema, Email, MinLength, Nullable, Optional, Required, SchemaOptions, ValidOptions } from "../../../src";

describe("Base decorators", function () {
  describe("@Required decorator", function () {
    describe("@Required overrides @Optional", function () {
      describe("same class", function () {
        class User {
          @Required()
          @Optional()
          public name: string;
        }

        it("should pass when field value is not empty string or undefined", () => {
          const user = new User();

          user.name = "Jane";
          expect(user).to.be.valid;
        });

        it("should error when field value is empty string or undefined", () => {
          const user = new User();

          expect(user).to.not.be.valid;

          user.name = "";
          expect(user).to.not.be.valid;
        });
      });

      describe("inheritance", function () {
        class Base {
          @Optional()
          public name: string;
        }

        class User extends Base {
          @Required()
          public name: string;
        }

        it("should pass when field value is not empty string or undefined", () => {
          const user = new User();

          user.name = "Jane";
          expect(user).to.be.valid;
        });

        it("should error when field value is empty string or undefined", () => {
          const user = new User();

          expect(user).to.not.be.valid;

          user.name = "";
          expect(user).to.not.be.valid;
        });
      });
    });

    describe("nullable type", function () {
      class User {
        @Required()
        public name: string | null;
      }

      it("should pass when field value is not undefined", () => {
        const user = new User();

        user.name = "Jane";
        expect(user).to.be.valid;

        user.name = null;
        expect(user).to.be.valid;

        user.name = "";
        expect(user).to.be.valid;
      });

      it("should error when field value is empty string, null or undefined", () => {
        const user = new User();

        expect(user).to.not.be.valid;
      });
    });

    describe("non-nullable string type", function () {
      class User {
        @Required()
        public name: string;
      }

      it("should pass when field value is not empty string or undefined", () => {
        const user = new User();

        user.name = "Jane";
        expect(user).to.be.valid;
      });

      it("should error when field value is empty string or undefined", () => {
        const user = new User();

        expect(user).to.not.be.valid;

        user.name = "";
        expect(user).to.not.be.valid;
      });
    });
  });

  describe("@Optional decorator", function () {
    describe("@Optional overrides @Required", function () {
      describe("same class", function () {
        class User {
          @Optional()
          @Required()
          public name: string;
        }

        it("should pass when field value that is optional is undefined", () => {
          const user = new User();

          expect(user).to.be.valid;
        });
      });

      describe("inheritance", function () {
        class Base {
          @Required()
          public name: string;
        }

        class User extends Base {
          @Optional()
          public name: string;
        }

        it("should pass when field value that is optional is undefined", () => {
          const user = new User();

          expect(user).to.be.valid;
        });
      });
    });
  });

  describe("@Nullable decorator", function () {
    describe("same class", function () {
      class User {
        @Required()
        public id: number;

        @Required()
        @Nullable()
        public name: string | null;
      }

      it("should pass when nullable field value is null", () => {
        const user = new User();

        user.id = 0;
        user.name = null;
        expect(user).to.be.valid;
      });

      it("should error when non-nullable field value is null", () => {
        const user = new User();

        (user as unknown as (object & { id: null })).id = null;
        user.name = null;
        expect(user).to.not.be.valid;
      });
    });

    describe("inheritance", function () {
      class Base {
        @Nullable()
        public id: number;
      }

      class User extends Base {
        @Required()
        @Nullable(false)
        public id: number;
      }

      it("should pass when field value is not null and false is passed to decorator", () => {
        const user = new User();

        user.id = 3;
        expect(user).to.be.valid;
      });

      it("should error when field value is null and false is passed to decorator", () => {
        const user = new User();

        (user as unknown as (object & { id: null })).id = null;
        expect(user).to.not.be.valid;
      });
    });
  });

  describe("@ValidOptions decorator", function () {
    enum RoleNames {
      Admin,
      Moderator,
      Viewer,
    }

    class User {
      @ValidOptions(RoleNames.Admin, RoleNames.Moderator)
      public role: RoleNames;
    }

    it("should pass when field value is part of value passed to decorator", () => {
      const user = new User();

      user.role = RoleNames.Admin;
      expect(user).to.be.valid;
    });

    it("should error when field value is not part of value passed to decorator", () => {
      const user = new User();

      user.role = RoleNames.Viewer;
      expect(user).to.not.be.valid;
    });
  });

  describe("@CustomSchema decorator", function () {
    describe("class decorator", function () {
      describe("Joi schema to override class schema", function () {
        @CustomSchema(Joi.object({ username: Joi.string().alphanum() }))
        class User {
          @MinLength(3)
          public name: string;

          @Email()
          public email: string;

          public username: string;
        }

        it("should pass when none of the attribute decorator constraints are met", () => {
          const user = new User();

          expect(user).to.be.valid;
        });

        it("should pass when decorator constraints are met", () => {
          const user = new User();

          user.username = "jane";
          expect(user).to.be.valid;
        });

        it("should error when decorator constraints are not met", () => {
          const user = new User();

          user.username = "####";
          expect(user).to.not.be.valid;
        });
      });
    });

    describe("attribute decorator", function () {
      describe("Joi schema to override attribute schema", function () {
        class User {
          @Email()
          @CustomSchema(Joi.string().uri())
          public url: string;
        }

        it("should pass when field value passes constraint that is passed as Joi schema to decorator", () => {
          const user = new User();

          user.url = "http://example.com";
          expect(user).to.be.valid;
        });

        it("should error when field value does not pass constraint that is passed as Joi schema to decorator", () => {
          const user = new User();

          user.url = "hello@example.com";
          expect(user).to.not.be.valid;
        });
      });

      describe("Joi schema function to extend attribute schema", function () {
        class User {
          @Required()
          @CustomSchema((j) => j.allow(""))
          public name: string;
        }

        it("should pass when field value passes constraint that is passed as Joi schema to decorator", () => {
          const user = new User();

          user.name = "";
          expect(user).to.be.valid;
        });
      });
    });
  });

  describe("@SchemaOptions decorator", function () {
    @SchemaOptions({ allowUnknown: true })
    class User {
      @Optional()
      public id: number;

      public name: string;
    }

    it("should pass when object complies with Joi validation options passed to decorator", () => {
      const user = new User();

      user.name = "Jane";
      expect(user).to.be.valid;
    });
  });
});
