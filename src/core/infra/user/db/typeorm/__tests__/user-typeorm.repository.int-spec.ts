import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { UserModel } from "../user-typeorm.model";
import { UserTypeOrmRepository } from "../user-typeorm.repository";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserFactory } from "@domain/user/user.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("User TypeOrm Repository - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [UserModel, RefreshTokenModel, EndpointModel],
  });

  let repository: UserTypeOrmRepository;

  beforeEach(() => {
    repository = new UserTypeOrmRepository(dataSource);
  });

  describe("insert()", () => {
    it("should insert a user", async () => {
      const user = UserFactory.fake().oneUser().build();

      await repository.insert(user);

      const foundUser = await repository.findByGoogleId(user.googleId);

      expect(foundUser!.toJSON()).toEqual(user.toJSON());
    });
  });

  describe("findByGoogleId()", () => {
    it("should return null if user not found", async () => {
      const user = UserFactory.fake().oneUser().build();
      await repository.insert(user);

      const foundUser = await repository.findByGoogleId(
        "non-existent-google-id",
      );
      expect(foundUser).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update an existing user", async () => {
      const user = UserFactory.fake().oneUser().build();
      await repository.insert(user);

      user.changeName("Updated Name");
      user.deactivate();
      user.changeEmail("updated@example.com");

      await repository.update(user);

      const updatedUser = await repository.findByGoogleId(user.googleId);

      expect(updatedUser!.toJSON()).toEqual(user.toJSON());
    });

    it("should throw an error when trying to update a non-existent user", async () => {
      const user = UserFactory.fake().oneUser().build();

      await expect(repository.update(user)).rejects.toThrow(NotFoundError);
    });
  });
});
