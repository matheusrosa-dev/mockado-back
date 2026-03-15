import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { EndpointModelMapper } from "../endpoint-model-mapper";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Endpoint Model Mapper - Integration Tests", () => {
  describe("toModel()", () => {
    it("should map Endpoint entity to EndpointModel", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .build();

      const endpointModel = EndpointModelMapper.toModel(endpoint);

      expect(endpointModel).toBeDefined();
      expect(endpointModel.endpointId).toBe(endpoint.endpointId.toString());
      expect(endpointModel.userId).toBe(endpoint.userId.toString());
      expect(endpointModel.title).toBe(endpoint.title);
      expect(endpointModel.method).toBe(endpoint.method);
      expect(endpointModel.description).toBe(endpoint.description);
      expect(endpointModel.delay).toBe(endpoint.delay);
      expect(endpointModel.statusCode).toBe(endpoint.statusCode.statusCode);
      expect(endpointModel.responseBodyType).toBeNull();
      expect(endpointModel.responseJson).toBeNull();
      expect(endpointModel.responseText).toBeNull();
      expect(endpointModel.createdAt).toEqual(endpoint.createdAt);
    });
  });

  describe("toEntity()", () => {
    it("should map EndpointModel to Endpoint entity", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .build();

      const endpointModel = EndpointModelMapper.toModel(endpoint);

      const mappedEndpoint = EndpointModelMapper.toEntity(endpointModel);

      expect(mappedEndpoint.toJSON()).toEqual(endpoint.toJSON());
    });
  });
});
