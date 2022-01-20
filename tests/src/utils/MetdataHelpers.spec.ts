import { expect } from "../../helpers";

import Joi from "joi";
import { CustomSchema, DateString, Email, Max, MaxLength, Min, MinLength, Nullable, Optional, Required, SchemaOptions, ValidOptions } from "../../../src";
import { getGlobalArgs, getMetadata, getOptions } from "../../../src/utils/MetadataHelpers";

describe("getMetadata function", function () {
  describe("same class", function () {
    enum RoleNames {
      Admin,
      Moderator,
      Viewer,
    }

    const allowEmptyFunc = (j: Joi.Schema) => j.allow("");

    class User {
      @Required()
      @MaxLength(50)
      @MinLength(10)
      public id: string;

      @Required()
      @CustomSchema(allowEmptyFunc)
      public name: string;

      @Optional()
      @Max(50)
      @Min({ value: 0, exclude: true })
      public rank: number;

      @ValidOptions(RoleNames.Admin, RoleNames.Moderator)
      public role: RoleNames;

      @Optional()
      @Email()
      public email: string;

      @Optional()
      @Nullable()
      @MaxLength(5)
      public favoriteColors: string[] | null;

      @Required()
      @DateString()
      public licensedAt: string;

      @Optional()
      public createdAt: Date;
    }

    it("should return undefined for Date class", () => {
      expect(getMetadata(Date)).to.be.undefined;
    });

    it("should return undefined for Array class", () => {
      expect(getMetadata(Array)).to.be.undefined;
    });

    it("should return undefined for Number class", () => {
      expect(getMetadata(Number)).to.be.undefined;
    });

    it("should return undefined for String class", () => {
      expect(getMetadata(String)).to.be.undefined;
    });

    it("should return undefined for Object class", () => {
      expect(getMetadata(Object)).to.be.undefined;
    });

    it("should return appropriate metadata for class", () => {
      expect(getMetadata(User)).to.be.eql({
        id: {
          designType:  String,
          minLength: 10,
          maxLength: 50,
          required: true,
        },
        name: {
          designType: String,
          customSchema: allowEmptyFunc,
          required: true,
        },
        rank: {
          designType: Number,
          minValue: { value: 0, exclude: true },
          maxValue: { value: 50 },
          required: false,
        },
        role: {
          designType: Number,
          options: [ 0, 1 ],
        },
        email: {
          designType: String,
          email: true,
          required: false,
        },
        favoriteColors: {
          designType: Object,
          maxLength: 5,
          nullable: true,
          required: false,
        },
        licensedAt: {
          designType: String,
          dateString: true,
          dateStringFormat: "YYYY-MM-DD",
          required: true,
        },
        createdAt: {
          designType: Date,
          required: false,
        },
      });
    });
  });

  describe("inheritance", function () {
    class Base {
      @Required()
      public id: string;
    }

    class User extends Base {
      @Optional()
      @Email()
      public email: string;
    }

    class Contact extends User {
      @Required()
      public phoneNumber: number;
    }

    it("should return appropriate metadata for class with Joi decorated parent class", () => {
      expect(getMetadata(User)).to.be.eql({
        id: { designType: String, required: true },
        email: { designType: String, email: true, required: false },
      });
    });

    it("should return appropriate metadata for class with Joi decorated grandparent class", () => {
      expect(getMetadata(Contact)).to.be.eql({
        id: { designType: String, required: true },
        email: { designType: String, email: true, required: false },
        phoneNumber: { designType: Number, required: true },
      });
    });
  });
});

describe("getOptions function", function () {
  describe("same class", function () {
    class Base {
      @Required()
      public id: number;
    }

    @SchemaOptions({ allowUnknown: true })
    class User {
      @Email()
      public email: string;
    }

    it("should return validation options passed to decorator", () => {
      expect(getOptions(User)).to.be.eql({ allowUnknown: true });
    });

    it("should return undefined when no validation options are passed to decorator", () => {
      expect(getOptions(Base)).to.be.undefined;
    });
  });

  describe("inheritance", function () {
    @SchemaOptions({ allowUnknown: true })
    class Base {
      @Required()
      public id: number;
    }

    class User extends Base {}

    class Post extends Base {
      @Required()
      public title: string;
    }

    it("should return validation options passed to decorator in parent class when class has no Joi decorators", () => {
      expect(getOptions(User)).to.be.eql({ allowUnknown: true });
    });

    it("should return undefined when class has Joi decorators", () => {
      expect(getOptions(Post)).to.be.undefined;
    });
  });
});

describe("getGlobalArgs function", function () {
  describe("same class", function () {
    const func = (j: Joi.Schema) => j.allow("");

    class Base {
      @Required()
      public id: number;
    }

    @CustomSchema(func)
    class User {
      @Email()
      public email: string;
    }

    it("should return Joi schema or schema function passed to decorator", () => {
      expect(getGlobalArgs(User)).to.be.eql(func);
    });

    it("should return undefined when no Joi schema or schema function is passed to decorator", () => {
      expect(getGlobalArgs(Base)).to.be.undefined;
    });
  });

  describe("inheritance", function () {
    const func = (j: Joi.Schema) => j.allow("");

    @CustomSchema(func)
    class Base {
      @Required()
      public id: number;
    }

    class User extends Base {}

    class Post extends Base {
      @Required()
      public title: string;
    }

    it("should return Joi schema or schema function passed to decorator in parent class when class has no Joi decorators", () => {
      expect(getGlobalArgs(User)).to.be.eql(func);
    });

    it("should return undefined when class has Joi decorators", () => {
      expect(getGlobalArgs(Post)).to.be.undefined;
    });
  });
});
