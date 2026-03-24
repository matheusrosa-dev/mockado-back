import { Uuid } from "../../shared/value-objects/uuid.vo";
import { UserFactory } from "../user.entity";

describe("User Fake Builder - Unit Tests", () => {
  describe("one user", () => {
    it("should instance a fake user with default values", () => {
      const fakeUser = UserFactory.fake().oneUser().build();

      expect(fakeUser.toJSON()).toEqual({
        userId: fakeUser.userId.toString(),
        googleId: fakeUser.googleId,
        email: fakeUser.email,
        name: fakeUser.name,
        isActive: fakeUser.isActive,
        createdAt: fakeUser.createdAt,
      });
    });

    it("should instance a fake user with custom values", () => {
      const id = new Uuid();

      const fakeUser = UserFactory.fake()
        .oneUser()
        .withUserId(id)
        .withGoogleId("123456789012345678901")
        .withEmail("custom@email.com")
        .withName("Custom Name")
        .withIsActive(false)
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeUser.toJSON()).toEqual({
        userId: id.toString(),
        googleId: "123456789012345678901",
        email: "custom@email.com",
        name: "Custom Name",
        isActive: false,
        createdAt: new Date("2024-01-01"),
      });
    });

    it("should instance a fake user with factory functions as values", () => {
      const fakeUser = UserFactory.fake()
        .oneUser()
        .withUserId(() => new Uuid())
        .withGoogleId(() => "987654321098765432109")
        .withEmail(() => "factory@email.com")
        .withName(() => "Factory Name")
        .withIsActive(() => true)
        .withCreatedAt(() => new Date("2025-06-15"))
        .build();

      expect(fakeUser.toJSON()).toEqual({
        userId: fakeUser.userId.toString(),
        googleId: fakeUser.googleId,
        email: fakeUser.email,
        name: fakeUser.name,
        isActive: fakeUser.isActive,
        createdAt: fakeUser.createdAt,
      });
    });
  });

  describe("many users", () => {
    it("should instance an array of fake users with default values", () => {
      const amount = 5;
      const fakeUsers = UserFactory.fake().manyUsers(amount).build();

      expect(fakeUsers).toHaveLength(amount);
      fakeUsers.forEach((user) => {
        expect(user.toJSON()).toEqual({
          userId: user.userId.toString(),
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
        });
      });
    });

    it("should instance an array of fake users with custom values", () => {
      const id = new Uuid();
      const amount = 3;

      const fakeUsers = UserFactory.fake()
        .manyUsers(amount)
        .withUserId(id)
        .withGoogleId("123456789012345678901")
        .withEmail("custom@email.com")
        .withName("Custom Name")
        .withIsActive(false)
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeUsers).toHaveLength(amount);
      fakeUsers.forEach((user) => {
        expect(user.toJSON()).toEqual({
          userId: id.toString(),
          googleId: "123456789012345678901",
          email: "custom@email.com",
          name: "Custom Name",
          isActive: false,
          createdAt: new Date("2024-01-01"),
        });
      });
    });

    it("should instance an array of fake users with factory functions as values", () => {
      const amount = 3;

      const fakeUsers = UserFactory.fake()
        .manyUsers(amount)
        .withGoogleId(() => "987654321098765432109")
        .withEmail(() => "factory@email.com")
        .withName(() => "Factory Name")
        .withIsActive(() => true)
        .withCreatedAt(() => new Date("2025-06-15"))
        .build();

      expect(fakeUsers).toHaveLength(amount);
      fakeUsers.forEach((user) => {
        expect(user.toJSON()).toEqual({
          userId: user.userId.toString(),
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
        });
      });
    });
  });
});
