import { EndpointInMemoryRepository } from "../../../../infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "../../../../domain/endpoint/endpoint.repository";
import { CreateEndpointUseCase } from "../create-endpoint.use-case";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../../domain/endpoint/endpoint.types";
import { EntityValidationError } from "../../../../domain/shared/validators/validation.error";
import { Uuid } from "../../../../domain/shared/value-objects/uuid.vo";

describe("Create Endpoint Use Case - Unit Tests", () => {
  let useCase: CreateEndpointUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
    useCase = new CreateEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should create an endpoint with required fields only", async () => {
      const input = {
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
      };

      const output = await useCase.execute(input);

      expect(output.id).toBeDefined();
      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.description).toBe("");
      expect(output.delay).toBe(0);
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it("should create an endpoint with all fields", async () => {
      const input = {
        title: "Full Endpoint",
        method: HttpMethod.POST,
        description: "A full endpoint",
        delay: 3,
        statusCode: 201,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
      };

      const output = await useCase.execute(input);

      expect(output.title).toBe(input.title);
      expect(output.method).toBe(input.method);
      expect(output.description).toBe(input.description);
      expect(output.delay).toBe(input.delay);
      expect(output.statusCode).toBe(input.statusCode);
      expect(output.responseBodyType).toBe(input.responseBodyType);
      expect(output.responseJson).toBe(input.responseJson);
    });

    it("should persist the endpoint in the repository", async () => {
      const input = {
        title: "Persisted Endpoint",
        method: HttpMethod.DELETE,
        statusCode: 204,
      };

      const output = await useCase.execute(input);

      const found = await repository.findById(new Uuid(output.id));
      expect(found).not.toBeNull();
      expect(found!.title).toBe(input.title);
    });

    it("should create an endpoint with TEXT response body type", async () => {
      const input = {
        title: "Text Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "Hello World",
      };

      const output = await useCase.execute(input);

      expect(output.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(output.responseText).toBe(input.responseText);
    });

    it("should throw EntityValidationError when title is empty", async () => {
      const input = {
        title: "",
        method: HttpMethod.GET,
        statusCode: 200,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it("should throw EntityValidationError when title exceeds 50 characters", async () => {
      const input = {
        title: "a".repeat(51),
        method: HttpMethod.GET,
        statusCode: 200,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it("should throw EntityValidationError when method is invalid", async () => {
      const input = {
        title: "Test",
        method: "INVALID" as HttpMethod,
        statusCode: 200,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it("should throw EntityValidationError when statusCode is out of range", async () => {
      const input = {
        title: "Test",
        method: HttpMethod.GET,
        statusCode: 99,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it("should throw EntityValidationError when delay exceeds maximum", async () => {
      const input = {
        title: "Test",
        method: HttpMethod.GET,
        statusCode: 200,
        delay: 11,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );
    });
  });
});
