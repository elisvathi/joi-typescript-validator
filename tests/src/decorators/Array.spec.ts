import { expect } from "../../helpers";
import { ItemType, MaxLength, MinLength, NotEmpty } from "../../../src";

describe("Array attribute decorators", function () {
  describe("@NotEmpty decorator", function () {
    class User {
      @NotEmpty()
      public favoriteColors: string[];
    }

    it("should pass when field value length is greater than 0", () => {
      const user = new User();

      user.favoriteColors = ["blue"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is 0", () => {
      const user = new User();

      user.favoriteColors = [];
      expect(user).to.not.be.valid;
    });
  });

  describe("@ItemType decorator", function () {
    class User {
      @ItemType(String)
      public favoriteColors: unknown[];
    }

    it("should pass when array field values are of the type passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = ["blue", "red"];
      expect(user).to.be.valid;
    });

    it("should error when array field values are not of the type passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = [Symbol("blue"), "red"];
      expect(user).to.not.be.valid;

      user.favoriteColors = [Symbol("blue"), 3];
      expect(user).to.not.be.valid;
    });
  });

  describe("@MinLength decorator", function () {
    class User {
      @MinLength(3)
      public favoriteColors: string[];
    }

    it("should pass when field value length is greater than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = ["blue", "red", "cyan"];
      expect(user).to.be.valid;

      user.favoriteColors = ["blue", "red", "cyan", "yellow"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is less than the value passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = ["blue", "red"];
      expect(user).to.not.be.valid;
    });
  });

  describe("@MaxLength decorator", function () {
    class User {
      @MaxLength(5)
      public favoriteColors: string[];
    }

    it("should pass when field value length is less than or equal to the value passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = ["blue", "red", "cyan", "yellow", "white"];
      expect(user).to.be.valid;

      user.favoriteColors = ["blue", "red", "cyan", "yellow"];
      expect(user).to.be.valid;
    });

    it("should error when field value length is greater than the value passed to the decorator", () => {
      const user = new User();

      user.favoriteColors = ["blue", "red", "cyan", "yellow", "white", "black"];
      expect(user).to.not.be.valid;
    });
  });
});
