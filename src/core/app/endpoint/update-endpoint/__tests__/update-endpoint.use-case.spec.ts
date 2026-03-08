import { EndpointInMemoryRepository } from "@infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { UpdateEndpointUseCase } from "../update-endpoint.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointOutputMapper } from "@app/endpoint/common/endpoint-output";

describe("Update Endpoint Use Case - Unit Tests", () => {
  let useCase: UpdateEndpointUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
    useCase = new UpdateEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should update the title of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        title: "Updated Title",
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe("Updated Title");
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(endpoint.responseBodyType);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the method of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        method: HttpMethod.POST,
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(HttpMethod.POST);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(endpoint.responseBodyType);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the statusCode of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        statusCode: 404,
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(404);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(endpoint.responseBodyType);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the description of an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        description: "A new description",
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe("A new description");
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(endpoint.responseBodyType);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the delay of an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        delay: 7,
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(7);
      expect(output.responseBodyType).toBe(endpoint.responseBodyType);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the responseBodyType to JSON and set responseJson", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"updated":true}',
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(output.responseJson).toBe('{"updated":true}');
      expect(output.responseText).toBe(endpoint.responseText);
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update the responseBodyType to TEXT and set responseText", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "Hello!",
      });

      expect(output.id).toBe(endpoint.entity_id.id);
      expect(output.title).toBe(endpoint.title);
      expect(output.method).toBe(endpoint.method);
      expect(output.statusCode).toBe(endpoint.statusCode);
      expect(output.description).toBe(endpoint.description);
      expect(output.delay).toBe(endpoint.delay);
      expect(output.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(output.responseJson).toBe(endpoint.responseJson);
      expect(output.responseText).toBe("Hello!");
      expect(output.createdAt).toEqual(endpoint.createdAt);
    });

    it("should update multiple fields at once", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        title: "Bulk Update",
        method: HttpMethod.DELETE,
        statusCode: 201,
        description: "Bulk description",
        delay: 5,
      });

      expect(output.title).toBe("Bulk Update");
      expect(output.method).toBe(HttpMethod.DELETE);
      expect(output.statusCode).toBe(201);
      expect(output.description).toBe("Bulk description");
      expect(output.delay).toBe(5);
    });

    it("should persist the updated endpoint in the repository", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      await useCase.execute({
        id: endpoint.entity_id.id,
        title: "Persisted Title",
      });

      const [stored] = inMemoryRepository.items;
      expect(stored.title).toBe("Persisted Title");
    });

    it("should throw NotFoundError when endpoint does not exist", async () => {
      await expect(
        useCase.execute({
          id: new Uuid().id,
          title: "Ghost",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw EntityValidationError when update produces an invalid entity", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;
      inMemoryRepository.items = [endpoint];

      await expect(
        useCase.execute({
          id: endpoint.entity_id.id,
          delay: 11, // Invalid: @Max(10) - triggers entity validation error
        }),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should return formatted output", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;

      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        id: endpoint.entity_id.id,
        delay: 3,
        description: "Updated description",
      });

      const outputMapped = EndpointOutputMapper.toOutput(endpoint);

      expect(output).toStrictEqual({
        ...outputMapped,
        id: output.id,
        createdAt: output.createdAt,
        delay: 3,
        description: "Updated description",
      });
    });
  });
});
