import { EndpointInMemoryRepository } from "../../../../infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "../../../../domain/endpoint/endpoint.repository";
import { CreateEndpointUseCase } from "../create-endpoint.use-case";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../../domain/endpoint/endpoint.types";
import { EntityValidationError } from "../../../../domain/shared/validators/validation.error";

describe("Create Endpoint Use Case - Unit Tests", () => {
  let useCase: CreateEndpointUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
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

      expect(output.id).toBeDefined();
      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.description).toBe("");
      expect(output.delay).toBe(0);
      expect(output.responseBodyType).toBe(input.responseBodyType);
      expect(output.responseJson).toBe(input.responseJson);
      expect(output.responseText).toBeUndefined();
      expect(output.createdAt).toBeInstanceOf(Date);
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

      expect(output.id).toBeDefined();
      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.description).toBe("");
      expect(output.delay).toBe(0);
      expect(output.responseBodyType).toBe(input.responseBodyType);
      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBe(input.responseText);
      expect(output.createdAt).toBeInstanceOf(Date);
    });

    it("should create an endpoint without body", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 204,
      };

      const output = await useCase.execute(input);

      expect(output.id).toBeDefined();
      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.description).toBe("");
      expect(output.delay).toBe(0);
      expect(output.responseBodyType).toBeUndefined();
      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
      expect(output.createdAt).toBeInstanceOf(Date);
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

      expect(output.id).toBeDefined();
      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.description).toBe(input.description);
      expect(output.delay).toBe(input.delay);
      expect(output.responseBodyType).toBeUndefined();
      expect(output.responseJson).toBeUndefined();
      expect(output.responseText).toBeUndefined();
      expect(output.createdAt).toBeInstanceOf(Date);
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
  });
});
