import { UserFactory } from "@domain/user/user.entity";
import { UserModelMapper } from "../user-model-mapper";

describe("User Model Mapper - Integration Tests", () => {
  describe("toModel()", () => {
    it("should map User entity to UserModel", () => {
      const user = UserFactory.fake().oneUser().build();

      const userModel = UserModelMapper.toModel(user);

      expect(userModel).toBeDefined();
      expect(userModel.userId).toBe(user.userId.toString());
      expect(userModel.googleId).toBe(user.googleId);
      expect(userModel.email).toBe(user.email);
      expect(userModel.name).toBe(user.name);
      expect(userModel.isActive).toBe(user.isActive);
      expect(userModel.createdAt).toEqual(user.createdAt);
    });
  });

  describe("toEntity()", () => {
    it("should map UserModel to User entity", () => {
      const user = UserFactory.fake().oneUser().build();

      const userModel = UserModelMapper.toModel(user);
      const mappedUser = UserModelMapper.toEntity(userModel);

      expect(mappedUser.toJSON()).toEqual(user.toJSON());
    });
  });
});
