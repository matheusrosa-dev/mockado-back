import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { FindEndpointUseCase } from "../find-endpoint.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { EndpointOutputMapper } from "@app/endpoint/common/endpoint.output";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { IUserRepository } from "@domain/user/user.repository";
import { UserFactory } from "@domain/user/user.entity";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";

describe("Find Endpoint Use Case - Integration Tests", () => {
  let useCase: FindEndpointUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, UserModel, RefreshTokenModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);

    useCase = new FindEndpointUseCase(endpointRepository);
  });

  describe("execute()", () => {
    it("should throw not found error if endpoint does not exist for the user", async () => {
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
          googleId: "some-google-id",
          userId: new Uuid().id,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should find an endpoint", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .withStatusCode(new StatusCode(204))
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const foundEndpoint = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
        googleId: user.googleId,
      });

      expect(foundEndpoint).toEqual({
        id: endpoint.endpointId.toString(),
        userId: endpoint.userId.toString(),
        title: endpoint.title,
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        description: endpoint.description,
        delay: endpoint.delay,
        createdAt: endpoint.createdAt,
      });
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
        endpointId: endpoint.endpointId.toString(),
        userId: user.userId.toString(),
        googleId: user.googleId,
      });

      expect(outputSpy).toHaveBeenCalledTimes(1);

      const outputMapped = EndpointOutputMapper.toOutput(endpoint);

      expect(output).toStrictEqual({
        ...outputMapped,
        id: output.id,
      });
    });
  });
});
