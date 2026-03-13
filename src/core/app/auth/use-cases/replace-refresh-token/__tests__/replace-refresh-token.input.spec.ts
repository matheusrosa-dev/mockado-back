/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { ReplaceRefreshTokenInput } from "../replace-refresh-token.input";

const validProps = {
  refreshTokenIdToRemove: "550e8400-e29b-41d4-a716-446655440000",
  newRefreshToken: "some-new-refresh-token",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  googleId: "1234567890",
};

function validate(props: object) {
  const input = new ReplaceRefreshTokenInput(props as any);
  return validateSync(input);
}

describe("Replace Refresh Token Input - Unit Tests", () => {
  describe("valid input", () => {
    it("should pass with valid props", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });
  });

  describe("refreshTokenIdToRemove", () => {
    it("should fail when refreshTokenIdToRemove is empty", () => {
      const errors = validate({ ...validProps, refreshTokenIdToRemove: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenIdToRemove");
    });

    it("should fail when refreshTokenIdToRemove is missing", () => {
      const { refreshTokenIdToRemove: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenIdToRemove");
    });

    it("should fail when refreshTokenIdToRemove is not a UUID", () => {
      const errors = validate({
        ...validProps,
        refreshTokenIdToRemove: "not-a-uuid",
      });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenIdToRemove");
    });

    it("should fail when refreshTokenIdToRemove is not a string", () => {
      const errors = validate({ ...validProps, refreshTokenIdToRemove: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenIdToRemove");
    });
  });

  describe("newRefreshToken", () => {
    it("should fail when newRefreshToken is empty", () => {
      const errors = validate({ ...validProps, newRefreshToken: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("newRefreshToken");
    });

    it("should fail when newRefreshToken is missing", () => {
      const { newRefreshToken: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("newRefreshToken");
    });

    it("should fail when newRefreshToken is not a string", () => {
      const errors = validate({ ...validProps, newRefreshToken: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("newRefreshToken");
    });
  });

  describe("userId", () => {
    it("should fail when userId is empty", () => {
      const errors = validate({ ...validProps, userId: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("userId");
    });

    it("should fail when userId is missing", () => {
      const { userId: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("userId");
    });

    it("should fail when userId is not a UUID", () => {
      const errors = validate({ ...validProps, userId: "not-a-uuid" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("userId");
    });

    it("should fail when userId is not a string", () => {
      const errors = validate({ ...validProps, userId: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("userId");
    });
  });

  describe("googleId", () => {
    it("should fail when googleId is empty", () => {
      const errors = validate({ ...validProps, googleId: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("googleId");
    });

    it("should fail when googleId is missing", () => {
      const { googleId: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("googleId");
    });

    it("should fail when googleId is not a string", () => {
      const errors = validate({ ...validProps, googleId: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("googleId");
    });
  });
});
