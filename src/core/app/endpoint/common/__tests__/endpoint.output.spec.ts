import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { EndpointOutputMapper } from "../endpoint.output";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Endpoint Output Mapper - Unit Tests", () => {
  describe("toOutput()", () => {
    it("should map all base fields correctly", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output).toEqual({
        id: endpoint.endpointId.toString(),
        title: endpoint.title,
        method: endpoint.method,
        description: endpoint.description,
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        createdAt: endpoint.createdAt,
        userId: endpoint.userId.toString(),
      });
    });

    it("should include responseBodyType when set", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"ok":true}')
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseBodyType).toBe(ResponseBodyType.JSON);
    });

    it("should include responseJson when responseBodyType is JSON", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"ok":true}')
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseJson).toBe('{"ok":true}');
      expect(output.responseText).toBeUndefined();
    });

    it("should include responseText when responseBodyType is TEXT", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("hello world")
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseText).toBe("hello world");
      expect(output.responseJson).toBeUndefined();
    });

    it("should not include responseJson or responseText when responseBodyType is NULL", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withResponseBodyType(ResponseBodyType.NULL)
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
    });

    it("should not include responseJson or responseText when responseBodyType is EMPTY", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
    });

    it("should not include responseBodyType when statusCode does not allow body", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output.responseBodyType).toBeUndefined();
      expect(output.responseJson).toBeUndefined();
    });

    it("should not contain the endpointId key in the output", () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const output = EndpointOutputMapper.toOutput(endpoint);

      expect(output).not.toHaveProperty("endpointId");
    });
  });
});
