import { expect } from "../../helpers";
import { DateString, Email, MaxLength, MinLength, NotEmpty } from "../../../src";

describe("String attribute type decorators", function () {
  describe("@Email decorator", function () {
    class User {
      @Email()
      public email: string;
    }

    it("should pass when field value is of correct email format", () => {
      const user = new User();

      user.email = "hello@example.com";
      expect(user).to.be.valid;
    });

    it("should error when field value is not of correct email format", () => {
      const user = new User();

      user.email = "lorem";
      expect(user).to.not.be.valid;
    });
  });

  describe("@NotEmpty decorator", function () {
    class User {
      @NotEmpty()
      public tag: string;
    }

    it("should pass when field value length is greater than 0", () => {
      const user = new User();

      user.tag = "Section A";
      expect(user).to.be.valid;
    });

    it("should error when field value length is 0", () => {
      const user = new User();

      user.tag = "";
      expect(user).to.not.be.valid;
    });
  });

  describe("@MinLength decorator", function () {
    class User {
      @MinLength(5)
      public tag: string;
    }

    it("should pass when field value length is greater than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.tag = "SEC-5";
      expect(user).to.be.valid;

      user.tag = "SEC-555";
      expect(user).to.be.valid;
    });

    it("should error when field value length is less than the value passed to the decorator", () => {
      const user = new User();

      user.tag = "SE-5";
      expect(user).to.not.be.valid;
    });
  });

  describe("@MaxLength decorator", function () {
    class User {
      @MaxLength(6)
      public tag: string;
    }

    it("should pass when field value length is less than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.tag = "SEC-55";
      expect(user).to.be.valid;

      user.tag = "SEC-5";
      expect(user).to.be.valid;
    });

    it("should error when field value length is greater than the value passed to the decorator", () => {
      const user = new User();

      user.tag = "SEC-555";
      expect(user).to.not.be.valid;
    });
  });

  describe("@DateString decorator", function () {
    describe("default format", function () {
      class User {
        @DateString()
        public createdAt: string;
      }

      it("should pass when field value is of default (YYYY-MM-DD) date format", () => {
        const user = new User();

        user.createdAt = "1913-12-20";
        expect(user).to.be.valid;
      });

      it("should error when field value is not of default (YYYY-MM-DD) date format", () => {
        const user = new User();

        user.createdAt = "1913-20-12";
        expect(user).to.not.be.valid;
      });
    });

    describe("custom format", function () {
      class User {
        @DateString("YYYY-DD-MM")
        public createdAt: string;
      }

      it("should pass when field value is of format passed to the decorator", () => {
        const user = new User();

        user.createdAt = "1913-20-12";
        expect(user).to.be.valid;
      });

      it("should error when field value is not of format passed to the decorator", () => {
        const user = new User();

        user.createdAt = "1913-12-20";
        expect(user).to.not.be.valid;
      });
    });
  });
});
