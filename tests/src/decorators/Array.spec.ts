import { expect } from "../../helpers";
import { ItemType, MaxLength, MinLength, NotEmpty } from "../../../src";

describe("Array attribute decorators", function () {
  describe("@NotEmpty decorator", function () {
    class User {
      @NotEmpty()
      public favouriteColors: string[];
    }

    it("should pass when field value length is greater than 0", () => {
      const user = new User();

      user.favouriteColors = ["blue"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is 0", () => {
      const user = new User();

      user.favouriteColors = [];
      expect(user).to.not.be.valid;
    });
  });

  describe("@ItemType decorator", function () {
    class User {
      @ItemType(String)
      public favouriteColors: unknown[];
    }

    it("should pass when array field values are of the type passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = ["blue", "red"];
      expect(user).to.be.valid;
    });

    it("should error when array field values are not of the type passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = [Symbol("blue"), "red"];
      expect(user).to.not.be.valid;

      user.favouriteColors = [Symbol("blue"), 3];
      expect(user).to.not.be.valid;
    });
  });

  describe("@MinLength decorator", function () {
    class User {
      @MinLength(3)
      public favouriteColors: string[];
    }

    it("should pass when field value length is greater than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = ["blue", "red", "cyan"];
      expect(user).to.be.valid;

      user.favouriteColors = ["blue", "red", "cyan", "yellow"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is less than the value passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = ["blue", "red"];
      expect(user).to.not.be.valid;
    });
  });

  describe("@MaxLength decorator", function () {
    class User {
      @MaxLength(5)
      public favouriteColors: string[];
    }

    it("should pass when field value length is less than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = ["blue", "red", "cyan", "yellow", "white"];
      expect(user).to.be.valid;

      user.favouriteColors = ["blue", "red", "cyan", "yellow"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is greater than the value passed to the decorator", () => {
      const user = new User();

      user.favouriteColors = ["blue", "red", "cyan", "yellow", "white", "black"];
      expect(user).to.not.be.valid;
    });
  });
});
