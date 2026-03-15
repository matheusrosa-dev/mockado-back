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
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { IUserRepository } from "@domain/user/user.repository";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";

describe("Update Endpoint Use Case - Integration Tests", () => {
  let useCase: UpdateEndpointUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, UserModel, RefreshTokenModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new UpdateEndpointUseCase(endpointRepository);
  });

  describe("execute()", () => {
    it("should update basic properties of an endpoint", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withTitle("Original Title")
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .withDescription("Original description")
        .withDelay(1)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
        googleId: user.googleId,
        title: "Updated Title",
        method: HttpMethod.POST,
        statusCode: 201,
        description: "Updated description",
        delay: 5,
      });

      const updatedEndpoint = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: user.userId,
      });

      expect(updatedEndpoint!.toJSON()).toEqual({
        endpointId: endpoint.endpointId.toString(),
        userId: endpoint.userId.toString(),
        title: output.title,
        method: output.method,
        description: output.description,
        statusCode: output.statusCode,
        delay: output.delay,
        responseBodyType: output.responseBodyType,
        responseJson: output.responseJson,
        responseText: output.responseText,
        createdAt: endpoint.createdAt,
      });
    });

    it("should update the responseBodyType to JSON and set responseJson", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.TEXT)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"updated":true}',
      });

      const updatedEndpoint = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: user.userId,
      });

      expect(updatedEndpoint!.toJSON()).toEqual({
        endpointId: endpoint.endpointId.toString(),
        userId: endpoint.userId.toString(),
        title: endpoint.title,
        method: endpoint.method,
        description: endpoint.description,
        statusCode: endpoint.statusCode.statusCode,
        delay: endpoint.delay,
        responseBodyType: output.responseBodyType,
        responseJson: output.responseJson,
        responseText: output.responseText,
        createdAt: endpoint.createdAt,
      });
    });

    it("should update the responseBodyType to TEXT and set responseText", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withStatusCode(new StatusCode(200))
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const output = await useCase.execute({
        userId: user.userId.toString(),
        id: endpoint.endpointId.toString(),
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "Hello!",
      });

      const updatedEndpoint = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: user.userId,
      });

      expect(updatedEndpoint!.toJSON()).toEqual({
        endpointId: endpoint.endpointId.toString(),
        userId: endpoint.userId.toString(),
        title: endpoint.title,
        method: endpoint.method,
        description: endpoint.description,
        statusCode: endpoint.statusCode.statusCode,
        delay: endpoint.delay,
        responseBodyType: output.responseBodyType,
        responseJson: output.responseJson,
        responseText: output.responseText,
        createdAt: endpoint.createdAt,
      });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await expect(
        useCase.execute({
          id: new Uuid().id,
          userId: new Uuid().id,
          description: "Updated description",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when endpoint does not exist", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      await expect(
        useCase.execute({
          id: new Uuid().id,
          userId: user.userId.toString(),
          description: "Updated description",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw EntityValidationError when update produces an invalid entity", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withMethod(HttpMethod.GET)
        .withStatusCode(new StatusCode(200))
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      await expect(
        useCase.execute({
          id: endpoint.endpointId.toString(),
          userId: user.userId.toString(),
          delay: 11, // Invalid: @Max(10) - triggers entity validation error
        }),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should return formatted output", async () => {
      const outputSpy = jest.spyOn(EndpointOutputMapper, "toOutput");

      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const output = await useCase.execute({
        id: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
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
