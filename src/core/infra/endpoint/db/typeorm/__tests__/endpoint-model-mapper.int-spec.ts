import { EndpointFactory } from "../../../../../domain/endpoint/endpoint.entity";
import { EndpointModelMapper } from "../endpoint-model-mapper";

describe("Endpoint Model Mapper - Integration ", () => {
  describe("toModel()", () => {
    it("should map Endpoint entity to EndpointModel", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(204)
        .build();

      const endpointModel = EndpointModelMapper.toModel(endpoint);

      expect(endpointModel).toBeDefined();
      expect(endpointModel.endpoint_id).toBe(endpoint.entity_id.id);
      expect(endpointModel.title).toBe(endpoint.title);
      expect(endpointModel.method).toBe(endpoint.method);
      expect(endpointModel.description).toBe(endpoint.description);
      expect(endpointModel.delay).toBe(endpoint.delay);
      expect(endpointModel.statusCode).toBe(endpoint.statusCode);
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
        .withStatusCode(204)
        .build();

      const endpointModel = EndpointModelMapper.toModel(endpoint);

      const mappedEndpoint = EndpointModelMapper.toEntity(endpointModel);

      expect(mappedEndpoint).toBeDefined();
      expect(mappedEndpoint.entity_id.id).toBe(endpoint.entity_id.id);
      expect(mappedEndpoint.title).toBe(endpoint.title);
      expect(mappedEndpoint.method).toBe(endpoint.method);
      expect(mappedEndpoint.description).toBe(endpoint.description);
      expect(mappedEndpoint.delay).toBe(endpoint.delay);
      expect(mappedEndpoint.statusCode).toBe(endpoint.statusCode);
      expect(mappedEndpoint.responseBodyType).toBeUndefined();
      expect(mappedEndpoint.responseJson).toBeUndefined();
      expect(mappedEndpoint.responseText).toBeUndefined();
      expect(mappedEndpoint.createdAt).toEqual(endpoint.createdAt);
    });
  });
});
