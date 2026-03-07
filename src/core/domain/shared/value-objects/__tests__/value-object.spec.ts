/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { ValueObject } from "../value-object";

class StringValueObject extends ValueObject {
  constructor(readonly value: string) {
    super();
  }
}

class NumberValueObject extends ValueObject {
  constructor(readonly value: number) {
    super();
  }
}

class ComplexValueObject extends ValueObject {
  constructor(
    readonly name: string,
    readonly age: number,
  ) {
    super();
  }
}

describe("ValueObject - Unit Tests", () => {
  describe("equals()", () => {
    it("should return true when two value objects have the same values", () => {
      const vo1 = new StringValueObject("test");
      const vo2 = new StringValueObject("test");

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("should return false when two value objects have different values", () => {
      const vo1 = new StringValueObject("test");
      const vo2 = new StringValueObject("other");

      expect(vo1.equals(vo2)).toBe(false);
    });

    it("should return false when compared to null", () => {
      const vo = new StringValueObject("test");

      expect(vo.equals(null as any)).toBe(false);
    });

    it("should return false when compared to undefined", () => {
      const vo = new StringValueObject("test");

      expect(vo.equals(undefined as any)).toBe(false);
    });

    it("should return false when comparing value objects of different types with same structure", () => {
      const stringVo = new StringValueObject("test" as any);
      const numberVo = new NumberValueObject("test" as any);

      expect(stringVo.equals(numberVo as any)).toBe(false);
    });

    it("should return true when two complex value objects have the same values", () => {
      const vo1 = new ComplexValueObject("Alice", 30);
      const vo2 = new ComplexValueObject("Alice", 30);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("should return false when two complex value objects differ in one field", () => {
      const vo1 = new ComplexValueObject("Alice", 30);
      const vo2 = new ComplexValueObject("Alice", 31);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it("should return true when comparing a value object to itself", () => {
      const vo = new StringValueObject("test");

      expect(vo.equals(vo)).toBe(true);
    });
  });
});
