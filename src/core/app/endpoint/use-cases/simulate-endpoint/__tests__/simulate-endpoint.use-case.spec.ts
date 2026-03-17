import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { IUserRepository } from "@domain/user/user.repository";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { SimulateEndpointUseCase } from "../simulate-endpoint.use-case";
import { UserFactory } from "@domain/user/user.entity";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { ResponseBodyType } from "@domain/endpoint/endpoint.types";

describe("Simulate Endpoint Use Case - Integration Tests", () => {
  let useCase: SimulateEndpointUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, RefreshTokenModel, UserModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new SimulateEndpointUseCase(endpointRepository);
  });

  describe("execute()", () => {
    it("should throw not found error if endpoint does not exist for the given user", async () => {
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
          userId: new Uuid().toString(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should simulate an endpoint and return response without body", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .withDelay(0)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(result).toEqual({
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
      });
    });

    it("should simulate an endpoint and return response with empty body", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withDelay(0)
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(result).toEqual({
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
      });
    });

    it("should simulate an endpoint and return response with null body", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withDelay(0)
        .withResponseBodyType(ResponseBodyType.NULL)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(result).toEqual({
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
      });
    });

    it("should simulate an endpoint and return response with text body", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withDelay(0)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("Sample text response")
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(result).toEqual({
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
        responseText: endpoint.responseText,
      });
    });

    it("should simulate an endpoint and return response with json body", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withDelay(0)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson(JSON.stringify({ message: "Sample JSON response" }))
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(result).toEqual({
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
        responseJson: JSON.parse(endpoint.responseJson!),
      });
    });

    it("should apply the endpoint delay before returning", async () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      const user = UserFactory.fake().oneUser().build();
      const delay = 5;
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200))
        .withDelay(delay)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
      });

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), delay);

      setTimeoutSpy.mockRestore();
    });
  });
});
