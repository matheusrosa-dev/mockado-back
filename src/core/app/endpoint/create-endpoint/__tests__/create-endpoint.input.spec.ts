/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { CreateEndpointInput } from "../create-endpoint.input";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";

const validProps = {
  title: "My Endpoint",
  method: HttpMethod.GET,
  statusCode: 200,
};

function validate(props: object) {
  const input = new CreateEndpointInput(props as any);
  return validateSync(input);
}

describe("Create Endpoint Input - Unit Tests", () => {
  describe("valid input", () => {
    it("should pass with only required fields", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should pass with all optional fields filled", () => {
      const errors = validate({
        ...validProps,
        description: "A description",
        delay: 500,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
        responseText: "some text",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with all HttpMethod values", () => {
      for (const method of Object.values(HttpMethod)) {
        const errors = validate({ ...validProps, method });
        expect(errors).toHaveLength(0);
      }
    });

    it("should pass with all ResponseBodyType values", () => {
      for (const responseBodyType of Object.values(ResponseBodyType)) {
        const errors = validate({ ...validProps, responseBodyType });
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe("title", () => {
    it("should fail when title is empty", () => {
      const errors = validate({ ...validProps, title: "" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("title");
    });

    it("should fail when title is missing", () => {
      const { title: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("title");
    });

    it("should fail when title is not a string", () => {
      const errors = validate({ ...validProps, title: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("title");
    });
  });

  describe("method", () => {
    it("should fail when method is an invalid enum value", () => {
      const errors = validate({ ...validProps, method: "INVALID" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("method");
    });

    it("should fail when method is missing", () => {
      const { method: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("method");
    });
  });

  describe("statusCode", () => {
    it("should fail when statusCode is not an integer", () => {
      const errors = validate({ ...validProps, statusCode: 200.5 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("statusCode");
    });

    it("should fail when statusCode is a string", () => {
      const errors = validate({ ...validProps, statusCode: "200" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("statusCode");
    });

    it("should fail when statusCode is less than 100", () => {
      const errors = validate({ ...validProps, statusCode: 99 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("statusCode");
    });

    it("should fail when statusCode is greater than 511", () => {
      const errors = validate({ ...validProps, statusCode: 512 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("statusCode");
    });

    it("should fail when statusCode is missing", () => {
      const { statusCode: _, ...rest } = validProps;
      const errors = validate(rest);
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("statusCode");
    });
  });

  describe("delay (optional)", () => {
    it("should pass when delay is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when delay is not an integer", () => {
      const errors = validate({ ...validProps, delay: 1.5 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("delay");
    });

    it("should fail when delay is a string", () => {
      const errors = validate({ ...validProps, delay: "500" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("delay");
    });
  });

  describe("responseBodyType (optional)", () => {
    it("should fail when responseBodyType is an invalid enum value", () => {
      const errors = validate({ ...validProps, responseBodyType: "xml" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("responseBodyType");
    });
  });

  describe("responseJson (optional)", () => {
    it("should fail when responseJson is not valid JSON", () => {
      const errors = validate({ ...validProps, responseJson: "not-json" });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("responseJson");
    });

    it("should pass when responseJson is a valid JSON string", () => {
      const errors = validate({
        ...validProps,
        responseJson: '{"ok":true}',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("responseText (optional)", () => {
    it("should fail when responseText is not a string", () => {
      const errors = validate({ ...validProps, responseText: 123 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("responseText");
    });
  });

  describe("description (optional)", () => {
    it("should fail when description is not a string", () => {
      const errors = validate({ ...validProps, description: 42 });
      const fields = errors.map((error) => error.property);
      expect(fields).toContain("description");
    });
  });
});
