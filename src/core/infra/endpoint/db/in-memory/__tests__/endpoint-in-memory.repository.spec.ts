import { Endpoint, EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointInMemoryRepository } from "../endpoint-in-memory.repository";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Endpoint In Memory Repository - Unit Tests", () => {
  let repository: EndpointInMemoryRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
  });

  describe("getEntity()", () => {
    it("should return the Endpoint constructor", () => {
      expect(repository.getEntity()).toBe(Endpoint);
    });
  });

  describe("insert()", () => {
    it("should insert an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();
      await repository.insert(endpoint);

      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toBe(endpoint);
    });
  });

  describe("findById()", () => {
    it("should return an endpoint by id", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();
      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.endpointId);
      expect(found).toBe(endpoint);
    });

    it("should return null when endpoint is not found", async () => {
      const found = await repository.findById(new Uuid());
      expect(found).toBeNull();
    });
  });

  describe("findAll()", () => {
    it("should return all endpoints", async () => {
      const endpoints = EndpointFactory.fake().manyEndpoints(2).build();

      await Promise.all(
        endpoints.map((endpoint) => repository.insert(endpoint)),
      );

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual(endpoints);
    });

    it("should return empty array when there are no endpoints", async () => {
      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe("findAllSummary()", () => {
    it("should return summary of all endpoints", async () => {
      const endpoints = EndpointFactory.fake().manyEndpoints(2).build();

      await Promise.all(
        endpoints.map((endpoint) => repository.insert(endpoint)),
      );

      const summaries = await repository.findAllSummary();

      expect(summaries).toHaveLength(2);
      expect(summaries[0]).toEqual({
        endpointId: endpoints[0].endpointId,
        title: endpoints[0].title,
        method: endpoints[0].method,
      });
      expect(summaries[1]).toEqual({
        endpointId: endpoints[1].endpointId,
        title: endpoints[1].title,
        method: endpoints[1].method,
      });
    });

    it("should return empty array when there are no endpoints", async () => {
      const summaries = await repository.findAllSummary();
      expect(summaries).toHaveLength(0);
    });
  });

  describe("update()", () => {
    it("should update an existing endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      endpoint.changeTitle("Updated");
      await repository.update(endpoint);

      expect(repository.items[0].title).toBe("Updated");
    });

    it("should throw NotFoundError when endpoint does not exist", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await expect(repository.update(endpoint)).rejects.toThrow(
        new NotFoundError(endpoint.endpointId.toString(), Endpoint),
      );
    });
  });

  describe("delete()", () => {
    it("should delete an existing endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      await repository.delete(endpoint.endpointId as Uuid);
      expect(repository.items).toHaveLength(0);
    });

    it("should throw NotFoundError when endpoint does not exist", async () => {
      const uuid = new Uuid();

      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid.toString(), Endpoint),
      );
    });
  });

  describe("integration", () => {
    it("should handle endpoints with responseBodyType JSON", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.endpointId as Uuid);
      expect(found?.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(found?.responseJson).toBe('{"key":"value"}');
    });

    it("should handle endpoints with responseBodyType TEXT", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("hello")
        .build();

      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.endpointId as Uuid);
      expect(found?.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(found?.responseText).toBe("hello");
    });

    it("should persist endpoints with different HTTP methods", async () => {
      const methods = Object.values(HttpMethod);

      const endpoints = methods.map((method) => {
        const endpoint = EndpointFactory.fake()
          .oneEndpoint()
          .withMethod(method)
          .build();
        return endpoint;
      });

      await Promise.all(
        endpoints.map((endpoint) => repository.insert(endpoint)),
      );

      const all = await repository.findAll();
      const storedMethods = all.map((endpoint) => endpoint.method);
      expect(storedMethods).toEqual(expect.arrayContaining(methods));
    });
  });
});
