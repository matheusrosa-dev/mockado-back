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
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { IUserRepository } from "@domain/user/user.repository";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";

describe("Create Endpoint Use Case - Integration Tests", () => {
  let useCase: CreateEndpointUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, RefreshTokenModel, UserModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new CreateEndpointUseCase(endpointRepository, userRepository);
  });

  describe("execute()", () => {
    it("should create an endpoint for a given userId", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const input = {
        userId: user.userId.toString(),
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await endpointRepository.findByIdWithUserId({
        endpointId: new Uuid(output.id),
        userId: new Uuid(input.userId),
      });

      expect(createdEndpoint).toBeDefined();
    });

    it("should create an endpoint for a given googleId", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const input = {
        googleId: user.googleId,
        title: "My Endpoint",
        method: HttpMethod.GET,
        statusCode: 200,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
      };

      const output = await useCase.execute(input);

      const createdEndpoint = await endpointRepository.findByIdWithUserId({
        endpointId: new Uuid(output.id),
        googleId: input.googleId,
      });

      expect(createdEndpoint).toBeDefined();
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

      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withStatusCode(new StatusCode(204))
        .build();

      await userRepository.insert(user);

      const output = await useCase.execute({
        userId: user.userId.toString(),
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
