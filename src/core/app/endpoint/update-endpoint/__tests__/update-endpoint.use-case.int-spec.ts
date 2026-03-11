import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { UpdateEndpointUseCase } from "../update-endpoint.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointOutputMapper } from "@app/endpoint/common/endpoint.output";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Update Endpoint Use Case - Integration Tests", () => {
  let useCase: UpdateEndpointUseCase;
  let repository: IEndpointRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel],
  });

  beforeEach(() => {
    repository = new EndpointTypeOrmRepository(dataSource);
    useCase = new UpdateEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should update the title of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        title: "Updated Title",
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the method of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        method: HttpMethod.POST,
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the statusCode of an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        statusCode: 404,
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the description of an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        description: "A new description",
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the delay of an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        delay: 7,
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the responseBodyType to JSON and set responseJson", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.TEXT)
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"updated":true}',
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update the responseBodyType to TEXT and set responseText", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "Hello!",
      });

      const updatedEndpoint = await repository.findById(new Uuid(output.id));

      expect(updatedEndpoint).not.toBeNull();
      expect(updatedEndpoint?.endpointId.toString()).toBe(output.id);
      expect(updatedEndpoint?.title).toBe(output.title);
      expect(updatedEndpoint?.method).toBe(output.method);
      expect(updatedEndpoint?.statusCode.statusCode).toBe(output.statusCode);
      expect(updatedEndpoint?.description).toBe(output.description);
      expect(updatedEndpoint?.delay).toBe(output.delay);
      expect(updatedEndpoint?.responseBodyType).toBe(output.responseBodyType);
      expect(updatedEndpoint?.responseJson).toBe(output.responseJson);
      expect(updatedEndpoint?.responseText).toBe(output.responseText);
      expect(updatedEndpoint?.createdAt).toEqual(output.createdAt);
    });

    it("should update multiple fields at once", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
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
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      await useCase.execute({
        id: endpoint.endpointId.toString(),
        title: "Persisted Title",
      });

      const updatedEndpoint = await repository.findById(
        new Uuid(endpoint.endpointId.toString()),
      );
      expect(updatedEndpoint?.title).toBe("Persisted Title");
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
        .withStatusCode(new StatusCode(200))
        .build();

      await repository.insert(endpoint);

      await expect(
        useCase.execute({
          id: endpoint.endpointId.toString(),
          delay: 11, // Invalid: @Max(10) - triggers entity validation error
        }),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should return formatted output", async () => {
      const outputSpy = jest.spyOn(EndpointOutputMapper, "toOutput");

      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        delay: 3,
        description: "Updated description",
      });

      expect(outputSpy).toHaveBeenCalledTimes(1);

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
