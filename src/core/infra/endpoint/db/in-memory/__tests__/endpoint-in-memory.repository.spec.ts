import {
  Endpoint,
  EndpointFactory,
} from "../../../../../domain/endpoint/endpoint.entity";
import { NotFoundError } from "../../../../../domain/shared/errors/not-found.error";
import { Uuid } from "../../../../../domain/shared/value-objects/uuid.vo";
import { EndpointInMemoryRepository } from "../endpoint-in-memory.repository";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../../../domain/endpoint/endpoint.types";

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

  describe("bulkInsert()", () => {
    it("should insert multiple endpoints", async () => {
      const endpoints = [
        EndpointFactory.fake().oneEndpoint().build(),
        EndpointFactory.fake().oneEndpoint().build(),
      ];
      await repository.bulkInsert(endpoints);

      expect(repository.items).toHaveLength(2);
      expect(repository.items[0]).toBe(endpoints[0]);
      expect(repository.items[1]).toBe(endpoints[1]);
    });
  });

  describe("findById()", () => {
    it("should return an endpoint by id", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();
      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.entity_id as Uuid);
      expect(found).toBe(endpoint);
    });

    it("should return null when endpoint is not found", async () => {
      const found = await repository.findById(new Uuid());
      expect(found).toBeNull();
    });
  });

  describe("findAll()", () => {
    it("should return all endpoints", async () => {
      const endpoints = [
        EndpointFactory.fake().oneEndpoint().build(),
        EndpointFactory.fake().oneEndpoint().build(),
      ];
      await repository.bulkInsert(endpoints);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual(endpoints);
    });

    it("should return empty array when there are no endpoints", async () => {
      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe("findByIds()", () => {
    it("should return endpoints matching the given ids", async () => {
      const endpoints = [
        EndpointFactory.fake().oneEndpoint().build(),
        EndpointFactory.fake().oneEndpoint().build(),
        EndpointFactory.fake().oneEndpoint().build(),
      ];
      await repository.bulkInsert(endpoints);

      const result = await repository.findByIds([
        endpoints[0].entity_id as Uuid,
        endpoints[2].entity_id as Uuid,
      ]);
      expect(result).toHaveLength(2);
      expect(result).toContain(endpoints[0]);
      expect(result).toContain(endpoints[2]);
    });

    it("should ignore ids that do not exist", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      const result = await repository.findByIds([
        endpoint.entity_id as Uuid,
        new Uuid(),
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(endpoint);
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
        new NotFoundError(endpoint.entity_id, Endpoint),
      );
    });
  });

  describe("delete()", () => {
    it("should delete an existing endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      await repository.delete(endpoint.entity_id as Uuid);
      expect(repository.items).toHaveLength(0);
    });

    it("should throw NotFoundError when endpoint does not exist", async () => {
      const uuid = new Uuid();

      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid, Endpoint),
      );
    });
  });

  describe("integration", () => {
    it("should handle endpoints with responseBodyType JSON", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.entity_id as Uuid);
      expect(found?.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(found?.responseJson).toBe('{"key":"value"}');
    });

    it("should handle endpoints with responseBodyType TEXT", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("hello")
        .build();

      await repository.insert(endpoint);

      const found = await repository.findById(endpoint.entity_id as Uuid);
      expect(found?.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(found?.responseText).toBe("hello");
    });

    it("should persist endpoints with different HTTP methods", async () => {
      const methods = Object.values(HttpMethod);

      const endpoints = methods.map((method) => {
        const endpoint = EndpointFactory.fake().oneEndpoint().build();
        endpoint.changeMethod(method);
        return endpoint;
      });
      await repository.bulkInsert(endpoints);

      const all = await repository.findAll();
      const storedMethods = all.map((e) => e.method);
      expect(storedMethods).toEqual(expect.arrayContaining(methods));
    });
  });
});
