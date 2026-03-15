import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { RefreshTokenModelMapper } from "../refresh-token-model-mapper";

describe("RefreshToken Model Mapper - Integration Tests", () => {
  describe("toModel()", () => {
    it("should map RefreshToken entity to RefreshTokenModel", () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      const refreshTokenModel = RefreshTokenModelMapper.toModel(refreshToken);

      expect(refreshTokenModel).toBeDefined();
      expect(refreshTokenModel.refreshTokenId).toBe(
        refreshToken.refreshTokenId.toString(),
      );
      expect(refreshTokenModel.userId).toBe(refreshToken.userId.toString());
      expect(refreshTokenModel.refreshTokenHash).toBe(
        refreshToken.refreshTokenHash,
      );
      expect(refreshTokenModel.googleId).toBe(refreshToken.googleId);
      expect(refreshTokenModel.createdAt).toEqual(refreshToken.createdAt);
    });
  });

  describe("toEntity()", () => {
    it("should map RefreshTokenModel to RefreshToken entity", () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      const refreshTokenModel = RefreshTokenModelMapper.toModel(refreshToken);
      const mappedRefreshToken =
        RefreshTokenModelMapper.toEntity(refreshTokenModel);

      expect(mappedRefreshToken.toJSON()).toEqual(refreshToken.toJSON());
    });
  });
});
