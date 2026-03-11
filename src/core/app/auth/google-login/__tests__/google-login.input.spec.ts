/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { GoogleLoginInput } from "../google-login.input";

const validProps = {
  googleId: "1234567890",
  email: "user@example.com",
  name: "John Doe",
  refreshToken: "some-refresh-token",
};

function validate(props: object) {
  const input = new GoogleLoginInput(props as any);
  return validateSync(input);
}

describe("Google Login Input - Unit Tests", () => {
  describe("valid input", () => {
    it("should pass with only required fields", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should pass with all optional fields filled", () => {
      const errors = validate({
        ...validProps,
        picture: "https://example.com/photo.jpg",
      });
      expect(errors).toHaveLength(0);
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

  describe("email", () => {
    it("should fail when email is empty", () => {
      const errors = validate({ ...validProps, email: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("email");
    });

    it("should fail when email is missing", () => {
      const { email: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("email");
    });

    it("should fail when email is not a valid email", () => {
      const errors = validate({ ...validProps, email: "not-an-email" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("email");
    });

    it("should fail when email is not a string", () => {
      const errors = validate({ ...validProps, email: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("email");
    });
  });

  describe("name", () => {
    it("should fail when name is empty", () => {
      const errors = validate({ ...validProps, name: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("name");
    });

    it("should fail when name is missing", () => {
      const { name: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("name");
    });

    it("should fail when name is not a string", () => {
      const errors = validate({ ...validProps, name: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("name");
    });
  });

  describe("refreshToken", () => {
    it("should fail when refreshToken is empty", () => {
      const errors = validate({ ...validProps, refreshToken: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshToken");
    });

    it("should fail when refreshToken is missing", () => {
      const { refreshToken: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshToken");
    });

    it("should fail when refreshToken is not a string", () => {
      const errors = validate({ ...validProps, refreshToken: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("refreshToken");
    });
  });

  describe("picture (optional)", () => {
    it("should pass when picture is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when picture is not a string", () => {
      const errors = validate({ ...validProps, picture: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("picture");
    });
  });
});
