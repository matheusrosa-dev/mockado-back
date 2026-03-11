import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { RefreshTokenModelMapper } from "../refresh-token-model-mapper";

describe("RefreshToken Model Mapper - Integration", () => {
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
      expect(refreshTokenModel.createdAt).toEqual(refreshToken.createdAt);
    });
  });

  describe("toEntity()", () => {
    it("should map RefreshTokenModel to RefreshToken entity", () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      const refreshTokenModel = RefreshTokenModelMapper.toModel(refreshToken);
      const mappedRefreshToken =
        RefreshTokenModelMapper.toEntity(refreshTokenModel);

      expect(mappedRefreshToken).toBeDefined();
      expect(mappedRefreshToken.refreshTokenId.toString()).toBe(
        refreshToken.refreshTokenId.toString(),
      );
      expect(mappedRefreshToken.userId.toString()).toBe(
        refreshToken.userId.toString(),
      );
      expect(mappedRefreshToken.refreshTokenHash).toBe(
        refreshToken.refreshTokenHash,
      );
      expect(mappedRefreshToken.createdAt).toEqual(refreshToken.createdAt);
    });
  });
});
