import { expect } from "../../helpers";

import Joi from "joi";
import { Email, getSchemaDescription, Max, MaxLength, Min, MinLength, Optional, Required } from "../../../src";


class User {
  @Required()
  @MaxLength(50)
  @MinLength(10)
  public id: string;

  @Optional()
  @Max(50)
  @Min(0)
  public rank: number;

  @Optional()
  @Email()
  public email: string;
}

describe("getSchemaDescription function", function () {
  it("should return empty Joi ObjectSchema description for Date class", () => {
    expect(getSchemaDescription(Date)).to.be.eql(Joi.object().keys({}).describe());
  });

  it("should return empty Joi ObjectSchema description for Array class", () => {
    expect(getSchemaDescription(Array)).to.be.eql(Joi.object().keys({}).describe());
  });

  it("should return empty Joi ObjectSchema description for Number class", () => {
    expect(getSchemaDescription(Number)).to.be.eql(Joi.object().keys({}).describe());
  });

  it("should return empty Joi ObjectSchema description for String class", () => {
    expect(getSchemaDescription(String)).to.be.eql(Joi.object().keys({}).describe());
  });

  it("should return empty Joi ObjectSchema description for Object class", () => {
    expect(getSchemaDescription(Object)).to.be.eql(Joi.object().keys({}).describe());
  });

  it("should return appropriate Joi ObjectSchema description for class", () => {
    expect(getSchemaDescription(User)).to.be.eql(
      Joi
        .object()
        .keys({
          id: Joi.string().min(10).max(50).required(),
          rank: Joi.number().min(0).max(50).optional(),
          email: Joi.string().email().optional(),
        })
        .describe()
    );
  });
});
