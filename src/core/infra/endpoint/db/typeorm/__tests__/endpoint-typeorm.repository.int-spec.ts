import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { EndpointModel } from "../endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "../endpoint-typeorm.repository";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserFactory } from "@domain/user/user.entity";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";

describe("Endpoint TypeOrm Repository - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel, UserModel, RefreshTokenModel],
  });

  let endpointRepository: EndpointTypeOrmRepository;
  let userRepository: UserTypeOrmRepository;

  beforeEach(() => {
    endpointRepository = new EndpointTypeOrmRepository(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
  });

  describe("insert()", () => {
    it("should insert endpoint successfully", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const model = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: user.userId,
      });

      expect(model).toBeDefined();
    });
  });

  describe("update()", () => {
    it("should update endpoint successfully", async () => {
      const users = UserFactory.fake().manyUsers(2).build();
      const [mainUser, diffUser] = users;

      const mainEndpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(mainUser.userId)
        .build();

      const diffEndpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(diffUser.userId)
        .build();

      await Promise.all(users.map((user) => userRepository.insert(user)));
      await Promise.all(
        [mainEndpoint, diffEndpoint].map((endpoint) =>
          endpointRepository.insert(endpoint),
        ),
      );

      mainEndpoint.changeTitle("Updated Title");
      await endpointRepository.update(mainEndpoint);

      const updatedModel = await endpointRepository.findByIdWithUserId({
        endpointId: mainEndpoint.endpointId,
        userId: mainUser.userId,
      });

      const nonUpdatedModel = await endpointRepository.findByIdWithUserId({
        endpointId: diffEndpoint.endpointId,
        userId: diffUser.userId,
      });

      expect(updatedModel!.title).toBe("Updated Title");
      expect(nonUpdatedModel!.title).toBe(diffEndpoint.title);
    });
  });

  describe("findSummaryByUserId()", () => {
    it("should return empty array when userId has no endpoints", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const endpoints = await endpointRepository.findSummaryByUserId(
        new Uuid(),
      );

      expect(endpoints).toHaveLength(0);
    });

    it("should return endpoints when userId has endpoints", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const endpoints = await endpointRepository.findSummaryByUserId(
        user.userId,
      );

      expect(endpoints).toHaveLength(1);
      expect(endpoints[0]).toEqual({
        endpointId: new Uuid(endpoint.endpointId.toString()),
        title: endpoint.title,
        method: endpoint.method,
      });
    });
  });

  describe("findByIdWithUserId()", () => {
    it("should return null if no endpoint is found with the given endpointId", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await endpointRepository.findByIdWithUserId({
        endpointId: new Uuid(),
        userId: user.userId,
      });

      expect(result).toBeNull();
    });

    it("should return null if no endpoint is found with the given userId", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: new Uuid(),
      });

      expect(result).toBeNull();
    });

    it("should return endpoint if found with the given endpointId and userId", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await endpointRepository.findByIdWithUserId({
        endpointId: endpoint.endpointId,
        userId: user.userId,
      });

      expect(result!.toJSON()).toEqual(endpoint.toJSON());
    });
  });

  describe("findById()", () => {
    it("should return null if no endpoint is found with the given endpointId", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await endpointRepository.findById(new Uuid());

      expect(result).toBeNull();
    });

    it("should return endpoint if found with the given endpointId", async () => {
      const user = UserFactory.fake().oneUser().build();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);
      await endpointRepository.insert(endpoint);

      const result = await endpointRepository.findById(endpoint.endpointId);

      expect(result!.toJSON()).toEqual(endpoint.toJSON());
    });
  });
});
