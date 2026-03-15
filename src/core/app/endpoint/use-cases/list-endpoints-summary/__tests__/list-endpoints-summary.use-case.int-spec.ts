import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { ListEndpointsSummaryUseCase } from "../list-endpoints-summary.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { IUserRepository } from "@domain/user/user.repository";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

describe("List Endpoints Summary Use Case - Integration Tests", () => {
  let useCase: ListEndpointsSummaryUseCase;
  let endpointRepository: IEndpointRepository;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, UserModel, RefreshTokenModel],
  });

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new ListEndpointsSummaryUseCase(endpointRepository);
  });

  describe("execute()", () => {
    it("should list all endpoints summary for a given user", async () => {
      const users = UserFactory.fake().manyUsers(2).build();
      const [mainUser, diffUser] = users;

      await Promise.all(users.map((user) => userRepository.insert(user)));

      const endpoints = EndpointFactory.fake()
        .manyEndpoints(2)
        .withUserId(mainUser.userId)
        .build();

      const diffEndpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(diffUser.userId)
        .build();

      await Promise.all(
        [...endpoints, diffEndpoint].map((endpoint) =>
          endpointRepository.insert(endpoint),
        ),
      );

      const endpointsList = await useCase.execute({
        userId: mainUser.userId.toString(),
        googleId: mainUser.googleId,
      });

      expect(endpointsList).toEqual(
        endpoints.map((endpoint) => ({
          id: endpoint.endpointId.toString(),
          title: endpoint.title,
          method: endpoint.method,
        })),
      );
    });

    it("should return an empty array if no endpoints found", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const endpointsList = await useCase.execute({
        userId: new Uuid().toString(),
      });

      expect(endpointsList).toEqual([]);
    });
  });
});
