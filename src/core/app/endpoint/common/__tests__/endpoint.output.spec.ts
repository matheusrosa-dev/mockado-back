import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointOutputMapper } from "../endpoint.output";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

const baseProps = {
  endpointId: new Uuid(),
  title: "My Endpoint",
  method: HttpMethod.GET,
  statusCode: new StatusCode(200),
  description: "A description",
  delay: 100,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("Endpoint Output Mapper - Unit Tests", () => {
  describe("toOutput()", () => {
    it("should map endpointId to id", () => {
      const entity = new Endpoint(baseProps);
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.id).toBe(baseProps.endpointId.toString());
    });

    it("should map all base fields correctly", () => {
      const entity = new Endpoint(baseProps);
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.title).toBe(baseProps.title);
      expect(output.method).toBe(baseProps.method);
      expect(output.description).toBe(baseProps.description);
      expect(output.statusCode).toBe(baseProps.statusCode.statusCode);
      expect(output.delay).toBe(baseProps.delay);
      expect(output.createdAt).toEqual(baseProps.createdAt);
    });

    it("should include responseBodyType when set", () => {
      const entity = new Endpoint({
        ...baseProps,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"ok":true}',
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseBodyType).toBe(ResponseBodyType.JSON);
    });

    it("should include responseJson when responseBodyType is JSON", () => {
      const entity = new Endpoint({
        ...baseProps,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"ok":true}',
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseJson).toBe('{"ok":true}');
      expect(output.responseText).toBeUndefined();
    });

    it("should include responseText when responseBodyType is TEXT", () => {
      const entity = new Endpoint({
        ...baseProps,
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "hello world",
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseText).toBe("hello world");
      expect(output.responseJson).toBeUndefined();
    });

    it("should not include responseJson or responseText when responseBodyType is NULL", () => {
      const entity = new Endpoint({
        ...baseProps,
        responseBodyType: ResponseBodyType.NULL,
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
    });

    it("should not include responseJson or responseText when responseBodyType is EMPTY", () => {
      const entity = new Endpoint({
        ...baseProps,
        responseBodyType: ResponseBodyType.EMPTY,
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
    });

    it("should not include responseBodyType when statusCode does not allow body", () => {
      const entity = new Endpoint({
        ...baseProps,
        statusCode: new StatusCode(204),
        responseBodyType: ResponseBodyType.JSON,
      });
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output.responseBodyType).toBeUndefined();
      expect(output.responseJson).toBeUndefined();
    });

    it("should not contain the endpointId key in the output", () => {
      const entity = new Endpoint(baseProps);
      const output = EndpointOutputMapper.toOutput(entity);

      expect(output).not.toHaveProperty("endpointId");
    });
  });
});
