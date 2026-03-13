import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { UserInMemoryRepository } from "../user-in-memory.repository";
import { User, UserFactory } from "@domain/user/user.entity";

describe("User In Memory Repository - Unit Tests", () => {
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
  });

  describe("getEntity()", () => {
    it("should return the User constructor", () => {
      expect(repository.getEntity()).toBe(User);
    });
  });

  describe("insert()", () => {
    it("should insert a user", async () => {
      const user = UserFactory.fake().oneUser().build();
      await repository.insert(user);

      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toBe(user);
    });

    it("should accumulate multiple inserted users", async () => {
      const users = UserFactory.fake().manyUsers(3).build();

      for (const user of users) {
        await repository.insert(user);
      }

      expect(repository.items).toHaveLength(3);
    });
  });

  describe("findByGoogleId()", () => {
    it("should return the user with the given Google ID", async () => {
      const users = UserFactory.fake().manyUsers(3).build();
      const targetUser = users[1];
      targetUser.changeEmail("newemail@example.com");

      await Promise.all(users.map((user) => repository.insert(user)));

      const result = await repository.findByGoogleId(targetUser.googleId);
      expect(result).toBeDefined();
      expect(result!.userId.equals(targetUser.userId)).toBe(true);
      expect(result!.email).toBe("newemail@example.com");
    });

    it("should return null when user with given Google ID does not exist", async () => {
      const result = await repository.findByGoogleId("non-existent-google-id");
      expect(result).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update an existing user", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withEmail("original@email.com")
        .withName("Original Name")
        .build();

      await repository.insert(user);

      user.changeName("Updated Name");
      await repository.update(user);

      const updated = await repository.findById(user.userId);
      expect(updated!.name).toBe("Updated Name");
      expect(updated!.email).toBe("original@email.com");
    });

    it("should only update the target user when multiple users exist", async () => {
      const users = UserFactory.fake().manyUsers(3).build();

      await Promise.all(users.map((user) => repository.insert(user)));

      users[1].changeName("Updated Name");
      await repository.update(users[1]);

      const result = await repository.findAll();
      expect(result[0].name).toBe(users[0].name);
      expect(result[1].name).toBe("Updated Name");
      expect(result[2].name).toBe(users[2].name);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      const user = UserFactory.fake().oneUser().build();

      await expect(repository.update(user)).rejects.toThrow(
        new NotFoundError(user.userId.toString(), User),
      );
    });
  });

  describe("delete()", () => {
    it("should delete an existing user", async () => {
      const user = UserFactory.fake().oneUser().build();

      await repository.insert(user);

      await repository.delete(user.userId as Uuid);
      expect(repository.items).toHaveLength(0);
    });

    it("should only delete the target user when multiple users exist", async () => {
      const users = UserFactory.fake().manyUsers(3).build();

      await Promise.all(users.map((user) => repository.insert(user)));

      await repository.delete(users[1].userId as Uuid);

      expect(repository.items).toHaveLength(2);
      expect(
        repository.items.find((user) => user.userId.equals(users[0].userId)),
      ).toBeDefined();
      expect(
        repository.items.find((user) => user.userId.equals(users[1].userId)),
      ).toBeUndefined();
      expect(
        repository.items.find((user) => user.userId.equals(users[2].userId)),
      ).toBeDefined();
    });

    it("should throw NotFoundError when user does not exist", async () => {
      const uuid = new Uuid();

      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid.toString(), User),
      );
    });
  });
});
