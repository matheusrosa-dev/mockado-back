/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { UpdateEndpointInput } from "../update-endpoint.input";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../../domain/endpoint/endpoint.types";

const validId = "550e8400-e29b-41d4-a716-446655440000";

const validProps = {
  id: validId,
};

function validate(props: object) {
  const input = new UpdateEndpointInput(props as any);
  return validateSync(input);
}

describe("Update Endpoint Input - Unit Tests", () => {
  describe("valid input", () => {
    it("should pass with only the required id field", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should pass with all optional fields filled", () => {
      const errors = validate({
        ...validProps,
        title: "My Endpoint",
        method: HttpMethod.GET,
        description: "A description",
        delay: 500,
        statusCode: 200,
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

  describe("id", () => {
    it("should fail when id is missing", () => {
      const errors = validate({});
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("id");
    });

    it("should fail when id is not a valid UUID", () => {
      const errors = validate({ ...validProps, id: "not-a-uuid" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("id");
    });

    it("should fail when id is an empty string", () => {
      const errors = validate({ ...validProps, id: "" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("id");
    });
  });

  describe("title (optional)", () => {
    it("should pass when title is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when title is not a string", () => {
      const errors = validate({ ...validProps, title: 123 });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("title");
    });
  });

  describe("method (optional)", () => {
    it("should pass when method is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when method is an invalid enum value", () => {
      const errors = validate({ ...validProps, method: "INVALID" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("method");
    });
  });

  describe("statusCode (optional)", () => {
    it("should pass when statusCode is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when statusCode is not an integer", () => {
      const errors = validate({ ...validProps, statusCode: 200.5 });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("statusCode");
    });

    it("should fail when statusCode is a string", () => {
      const errors = validate({ ...validProps, statusCode: "200" });
      const fields = errors.map((e) => e.property);
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
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("delay");
    });

    it("should fail when delay is a string", () => {
      const errors = validate({ ...validProps, delay: "500" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("delay");
    });
  });

  describe("responseBodyType (optional)", () => {
    it("should pass when responseBodyType is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when responseBodyType is an invalid enum value", () => {
      const errors = validate({ ...validProps, responseBodyType: "xml" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("responseBodyType");
    });
  });

  describe("responseJson (optional)", () => {
    it("should pass when responseJson is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when responseJson is not valid JSON", () => {
      const errors = validate({ ...validProps, responseJson: "not-json" });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("responseJson");
    });

    it("should pass when responseJson is a valid JSON string", () => {
      const errors = validate({ ...validProps, responseJson: '{"ok":true}' });
      expect(errors).toHaveLength(0);
    });
  });

  describe("responseText (optional)", () => {
    it("should pass when responseText is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when responseText is not a string", () => {
      const errors = validate({ ...validProps, responseText: 123 });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("responseText");
    });
  });

  describe("description (optional)", () => {
    it("should pass when description is absent", () => {
      const errors = validate(validProps);
      expect(errors).toHaveLength(0);
    });

    it("should fail when description is not a string", () => {
      const errors = validate({ ...validProps, description: 42 });
      const fields = errors.map((e) => e.property);
      expect(fields).toContain("description");
    });
  });
});
