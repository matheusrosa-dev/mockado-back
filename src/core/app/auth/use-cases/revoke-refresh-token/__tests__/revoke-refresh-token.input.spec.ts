/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { RevokeRefreshTokenInput } from "../revoke-refresh-token.input";

const validProps = {
  refreshTokenId: "550e8400-e29b-41d4-a716-446655440000",
};

function validate(props: object) {
  const input = new RevokeRefreshTokenInput(props as any);
  return validateSync(input);
}

describe("Revoke Refresh Token Input - Unit Tests", () => {
  describe("valid input", () => {
    it("should pass with valid props", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });
  });

  describe("refreshTokenId", () => {
    it("should fail when refreshTokenId is empty", () => {
      const errors = validate({ ...validProps, refreshTokenId: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenId");
    });

    it("should fail when refreshTokenId is missing", () => {
      const { refreshTokenId: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenId");
    });

    it("should fail when refreshTokenId is not a UUID", () => {
      const errors = validate({ ...validProps, refreshTokenId: "not-a-uuid" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenId");
    });

    it("should fail when refreshTokenId is not a string", () => {
      const errors = validate({ ...validProps, refreshTokenId: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshTokenId");
    });
  });
});
