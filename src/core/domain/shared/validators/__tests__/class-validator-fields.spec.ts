import { IsNotEmpty, IsString, IsInt, Min } from "class-validator";
import { ClassValidatorFields } from "../class-validator-fields";
import { Notification } from "../../notification";

class StubValidator extends ClassValidatorFields {}

class StubData {
  @IsNotEmpty({ groups: ["name"] })
  @IsString({ groups: ["name"] })
  name: string;

  @IsNotEmpty({ groups: ["age"] })
  @IsInt({ groups: ["age"] })
  @Min(0, { groups: ["age"] })
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

describe("ClassValidatorFields", () => {
  let validator: StubValidator;
  let notification: Notification;

  beforeEach(() => {
    validator = new StubValidator();
    notification = new Notification();
  });

  describe("validate - valid data", () => {
    it("should return true and add no errors when data is valid", () => {
      const data = new StubData("John", 25);
      const result = validator.validate(notification, data, ["name", "age"]);
      expect(result).toBe(true);
      expect(notification.hasErrors()).toBe(false);
    });

    it("should return true when validating only a subset of valid fields", () => {
      const data = new StubData("John", -1); // age is invalid but not in group
      const result = validator.validate(notification, data, ["name"]);
      expect(result).toBe(true);
      expect(notification.hasErrors()).toBe(false);
    });
  });

  describe("validate - invalid data", () => {
    it("should return false when a required field is empty", () => {
      const data = new StubData("", 25);
      const result = validator.validate(notification, data, ["name"]);
      expect(result).toBe(false);
    });

    it("should add errors to notification when validation fails", () => {
      const data = new StubData("", 25);
      validator.validate(notification, data, ["name"]);
      expect(notification.hasErrors()).toBe(true);
      expect(notification.errors.has("name")).toBe(true);
    });

    it("should collect error messages under the correct field", () => {
      const data = new StubData("", 25);
      validator.validate(notification, data, ["name"]);
      const errors = notification.errors.get("name") as string[];
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should return false and record errors for invalid age", () => {
      const data = new StubData("John", -5);
      const result = validator.validate(notification, data, ["age"]);
      expect(result).toBe(false);
      expect(notification.errors.has("age")).toBe(true);
    });

    it("should accumulate errors for multiple invalid fields", () => {
      const data = new StubData("", -1);
      validator.validate(notification, data, ["name", "age"]);
      expect(notification.errors.has("name")).toBe(true);
      expect(notification.errors.has("age")).toBe(true);
    });

    it("should not add errors for fields outside the requested groups", () => {
      const data = new StubData("", -1); // both invalid
      validator.validate(notification, data, ["name"]); // only validate name
      expect(notification.errors.has("name")).toBe(true);
      expect(notification.errors.has("age")).toBe(false);
    });
  });

  describe("validate - empty groups", () => {
    it("should still validate and return false when groups array is empty and data is invalid", () => {
      const data = new StubData("", -1);
      const result = validator.validate(notification, data, []);
      expect(result).toBe(false);
      expect(notification.hasErrors()).toBe(true);
    });
  });

  describe("validate - multiple calls accumulate errors", () => {
    it("should accumulate errors across multiple validate calls on the same notification", () => {
      const data = new StubData("", -1);
      validator.validate(notification, data, ["name"]);
      validator.validate(notification, data, ["age"]);
      expect(notification.errors.has("name")).toBe(true);
      expect(notification.errors.has("age")).toBe(true);
    });
  });
});
