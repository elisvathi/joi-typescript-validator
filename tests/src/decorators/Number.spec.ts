import { expect } from "../../helpers";
import { Max, Min, Negative, Positive } from "../../../src";

describe("Number attribute decorators", function () {
  describe("@Min decorator", function () {
    describe("inclusive case", function () {
      class User {
        @Min(3)
        public code: number;
      }

      it("should pass when field value is greater than or equal to the value passed to the decorator", () => {
        const user = new User();

        user.code = 3;
        expect(user).to.be.valid;

        user.code = 4;
        expect(user).to.be.valid;
      });

      it("should error when field value is less than the value passed to the decorator", () => {
        const user = new User();

        user.code = 2;
        expect(user).to.not.be.valid;
      });
    });

    describe("exclusive case", function () {
      class User {
        @Min({ value: 3, exclude: true })
        public code: number;
      }

      it("should pass when field value is greater the value passed to the decorator", () => {
        const user = new User();

        user.code = 4;
        expect(user).to.be.valid;
      });

      it("should error when field value is less than or equal to the value passed to the decorator", () => {
        const user = new User();

        user.code = 3;
        expect(user).to.not.be.valid;

        user.code = 2;
        expect(user).to.not.be.valid;
      });
    });
  });

  describe("@Max decorator", function () {
    describe("inclusive case", function () {
      class User {
        @Max(3)
        public code: number;
      }

      it("should pass when field value is less than or equal to the value passed to the decorator", () => {
        const user = new User();

        user.code = 3;
        expect(user).to.be.valid;

        user.code = 2;
        expect(user).to.be.valid;
      });

      it("should error when field value is greater than the value passed to the decorator", () => {
        const user = new User();

        user.code = 4;
        expect(user).to.not.be.valid;
      });
    });

    describe("exclusive case", function () {
      class User {
        @Max({ value: 3, exclude: true })
        public code: number;
      }

      it("should pass when field value is less than the value passed to the decorator", () => {
        const user = new User();

        user.code = 2;
        expect(user).to.be.valid;
      });

      it("should error when field value is greater than or equal to the value passed to the decorator", () => {
        const user = new User();

        user.code = 3;
        expect(user).to.not.be.valid;

        user.code = 4;
        expect(user).to.not.be.valid;
      });
    });
  });

  describe("@Positive decorator", function () {
    describe("same class", function () {
      class User {
        @Positive()
        public code: number;
      }

      it("should pass when field value is greater than 0", () => {
        const user = new User();

        user.code = 1;
        expect(user).to.be.valid;
      });

      it("should error when field value is less than or equal to 0", () => {
        const user = new User();

        user.code = 0;
        expect(user).to.not.be.valid;

        user.code = -1;
        expect(user).to.not.be.valid;
      });
    });

    describe("inheritance", function () {
      class Base {
        @Positive()
        public code: number;
      }

      class User extends Base {
        @Positive(false)
        public code: number;
      }

      it("should pass when field value is less than or equal to 0 and false is passed to decorator", () => {
        const user = new User();

        user.code = 0;
        expect(user).to.be.valid;

        user.code = -1;
        expect(user).to.be.valid;
      });
    });
  });

  describe("@Negative decorator", function () {
    describe("same class", function () {
      class User {
        @Negative()
        public code: number;
      }

      it("should pass when field value is less than 0", () => {
        const user = new User();

        user.code = -1;
        expect(user).to.be.valid;
      });

      it("should error when field value is greater than or equal to 0", () => {
        const user = new User();

        user.code = 0;
        expect(user).to.not.be.valid;

        user.code = 1;
        expect(user).to.not.be.valid;
      });
    });

    describe("inheritance", function () {
      class Base {
        @Negative()
        public code: number;
      }

      class User extends Base {
        @Negative(false)
        public code: number;
      }

      it("should pass when field value is greater than or equal to 0 and false is passed to decorator", () => {
        const user = new User();

        user.code = 1;
        expect(user).to.be.valid;
      });
    });
  });
});
