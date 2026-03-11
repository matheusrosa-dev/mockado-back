import { UserFactory } from "@domain/user/user.entity";
import { UserModelMapper } from "../user-model-mapper";

describe("User Model Mapper - Integration", () => {
  describe("toModel()", () => {
    it("should map User entity to UserModel", () => {
      const user = UserFactory.fake().oneUser().build();

      const userModel = UserModelMapper.toModel(user);

      expect(userModel).toBeDefined();
      expect(userModel.userId).toBe(user.userId.toString());
      expect(userModel.googleId).toBe(user.googleId);
      expect(userModel.email).toBe(user.email);
      expect(userModel.name).toBe(user.name);
      expect(userModel.picture).toBe(user.picture);
      expect(userModel.isActive).toBe(user.isActive);
      expect(userModel.createdAt).toEqual(user.createdAt);
    });

    it("should map picture as null when not provided", () => {
      const user = UserFactory.fake()
        .oneUser()
        .withPicture(undefined as any)
        .build();

      const userModel = UserModelMapper.toModel(user);

      expect(userModel.picture).toBeNull();
    });
  });

  describe("toEntity()", () => {
    it("should map UserModel to User entity", () => {
      const user = UserFactory.fake().oneUser().build();

      const userModel = UserModelMapper.toModel(user);
      const mappedUser = UserModelMapper.toEntity(userModel);

      expect(mappedUser).toBeDefined();
      expect(mappedUser.userId.toString()).toBe(user.userId.toString());
      expect(mappedUser.googleId).toBe(user.googleId);
      expect(mappedUser.email).toBe(user.email);
      expect(mappedUser.name).toBe(user.name);
      expect(mappedUser.picture).toBe(user.picture);
      expect(mappedUser.isActive).toBe(user.isActive);
      expect(mappedUser.createdAt).toEqual(user.createdAt);
    });
  });
});
