import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { CreateEndpointUseCase } from "../create-endpoint.use-case";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { EndpointOutputMapper } from "@app/endpoint/common/endpoint.output";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Create Endpoint Use Case - Integration Tests", () => {
  let useCase: CreateEndpointUseCase;
  let repository: IEndpointRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel],
  });

  beforeEach(() => {
    repository = new EndpointTypeOrmRepository(dataSource);
    useCase = new CreateEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should create an endpoint with JSON body", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await repository.findById(new Uuid(output.id));

      expect(createdEndpoint).toBeDefined();
      expect(createdEndpoint?.title).toBe(input.title);
      expect(createdEndpoint?.method).toBe(input.method);
      expect(createdEndpoint?.statusCode.statusCode).toBe(input.statusCode);
      expect(createdEndpoint?.description).toBe("");
      expect(createdEndpoint?.delay).toBe(0);
      expect(createdEndpoint?.responseBodyType).toBe(input.responseBodyType);
      expect(createdEndpoint?.responseJson).toBe(input.responseJson);
      expect(createdEndpoint?.responseText).toBeUndefined();
      expect(createdEndpoint?.createdAt).toBeInstanceOf(Date);
    });

    it("should create an endpoint with TEXT body", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "Hello, world!",
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await repository.findById(new Uuid(output.id));

      expect(createdEndpoint).toBeDefined();
      expect(createdEndpoint?.title).toBe(input.title);
      expect(createdEndpoint?.method).toBe(input.method);
      expect(createdEndpoint?.statusCode?.statusCode).toBe(input.statusCode);
      expect(createdEndpoint?.description).toBe("");
      expect(createdEndpoint?.delay).toBe(0);
      expect(createdEndpoint?.responseBodyType).toBe(input.responseBodyType);
      expect(createdEndpoint?.responseJson).toBeUndefined();
      expect(createdEndpoint?.responseText).toBe(input.responseText);
      expect(createdEndpoint?.createdAt).toBeInstanceOf(Date);
    });

    it("should create an endpoint without body", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 204,
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await repository.findById(new Uuid(output.id));

      expect(createdEndpoint).toBeDefined();
      expect(createdEndpoint?.title).toBe(input.title);
      expect(createdEndpoint?.method).toBe(input.method);
      expect(createdEndpoint?.statusCode?.statusCode).toBe(input.statusCode);
      expect(createdEndpoint?.description).toBe("");
      expect(createdEndpoint?.delay).toBe(0);
      expect(createdEndpoint?.responseBodyType).toBeUndefined();
      expect(createdEndpoint?.responseJson).toBeUndefined();
      expect(createdEndpoint?.responseText).toBeUndefined();
      expect(createdEndpoint?.createdAt).toBeInstanceOf(Date);
    });

    it("should create an endpoint with description and delay", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 204,
        description: "A description",
        delay: 5,
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await repository.findById(new Uuid(output.id));

      expect(createdEndpoint).toBeDefined();
      expect(createdEndpoint?.title).toBe(input.title);
      expect(createdEndpoint?.method).toBe(input.method);
      expect(createdEndpoint?.statusCode?.statusCode).toBe(input.statusCode);
      expect(createdEndpoint?.description).toBe(input.description);
      expect(createdEndpoint?.delay).toBe(input.delay);
      expect(createdEndpoint?.responseBodyType).toBeUndefined();
      expect(createdEndpoint?.responseJson).toBeUndefined();
      expect(createdEndpoint?.responseText).toBeUndefined();
      expect(createdEndpoint?.createdAt).toBeInstanceOf(Date);
    });

    it("should throw EntityValidationError when input is not valid", async () => {
      const input = {
        title: "", // Invalid: empty title
        method: HttpMethod.GET,
        statusCode: 204,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it("should return formatted output", async () => {
      const outputSpy = jest.spyOn(EndpointOutputMapper, "toOutput");

      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .build();

      const output = await useCase.execute({
        title: endpoint.title,
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        description: endpoint.description,
        delay: endpoint.delay,
      });
      expect(outputSpy).toHaveBeenCalledTimes(1);

      const outputMapped = EndpointOutputMapper.toOutput(endpoint);

      expect(output).toStrictEqual({
        ...outputMapped,
        id: output.id,
        createdAt: output.createdAt,
      });
    });
  });
});
