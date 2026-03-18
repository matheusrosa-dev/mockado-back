import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { IUserRepository } from "@domain/user/user.repository";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { MockEndpointUseCase } from "../mock-endpoint.use-case";
import { UserFactory } from "@domain/user/user.entity";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { CryptoApiKeyService } from "@infra/me/services/crypto-api-key.service";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

describe("Mock Endpoint Use Case - Integration Tests", () => {
  let useCase: MockEndpointUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;
  const apiKeyService = new CryptoApiKeyService();

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, RefreshTokenModel, UserModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new MockEndpointUseCase(endpointRepository, apiKeyService);
  });

  describe("execute()", () => {
    it("should throw not found error if endpoint does not exist for the given endpointId", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await expect(
        useCase.execute({
          endpointId: new Uuid().toString(),
          apiKey: apiKey.apiKey,
          method: endpoint.method,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw not found error if endpoint does not exist for the given apiKeyHash", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await expect(
        useCase.execute({
          endpointId: endpoint.endpointId.toString(),
          apiKey: apiKeyService.generate().apiKey,
          method: endpoint.method,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw not found error if endpoint does not exist for the given method", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.POST)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await expect(
        useCase.execute({
          endpointId: endpoint.endpointId.toString(),
          apiKey: apiKey.apiKey,
          method: HttpMethod.GET,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should return undefined response for status code which does not have a body", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        apiKey: apiKey.apiKey,
        method: endpoint.method,
      });

      expect(result).toEqual({
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: undefined,
      });
    });

    it("should return undefined response for empty ResponseBodyType", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        apiKey: apiKey.apiKey,
        method: endpoint.method,
      });

      expect(result).toEqual({
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: undefined,
      });
    });

    it("should return null response for null ResponseBodyType", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.NULL)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        apiKey: apiKey.apiKey,
        method: endpoint.method,
      });

      expect(result).toEqual({
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: null,
      });
    });

    it("should return string response for text ResponseBodyType", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("Sample text response")
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        apiKey: apiKey.apiKey,
        method: endpoint.method,
      });

      expect(result).toEqual({
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: "Sample text response",
      });
    });

    it("should return json response for json ResponseBodyType", async () => {
      const apiKey = apiKeyService.generate();

      const user = UserFactory.fake()
        .oneUser()
        .withApiKeyHash(apiKey.apiKeyHash)
        .build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key": "value"}')
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        apiKey: apiKey.apiKey,
        method: endpoint.method,
      });

      expect(result).toEqual({
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: { key: "value" },
      });
    });
  });
});
