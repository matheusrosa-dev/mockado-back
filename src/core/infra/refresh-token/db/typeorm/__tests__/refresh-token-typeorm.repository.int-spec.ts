import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "../refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "../refresh-token-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

describe("Refresh Token TypeOrm Repository - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel],
  });

  let refreshTokenRepository: RefreshTokenTypeOrmRepository;
  let userRepository: UserTypeOrmRepository;

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
  });

  describe("insert()", () => {
    it("should insert a refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(user.userId)
        .build();

      await refreshTokenRepository.insert(refreshToken);

      const foundRefreshTokens = await refreshTokenRepository.findManyByAnyId({
        userId: refreshToken.userId,
      });

      expect(foundRefreshTokens).toHaveLength(1);
      expect(
        foundRefreshTokens[0].refreshTokenId.equals(
          refreshToken.refreshTokenId,
        ),
      ).toBe(true);
      expect(foundRefreshTokens[0].userId.equals(refreshToken.userId)).toBe(
        true,
      );
      expect(foundRefreshTokens[0].refreshTokenHash).toBe(
        refreshToken.refreshTokenHash,
      );
      expect(foundRefreshTokens[0].createdAt).toEqual(refreshToken.createdAt);
    });
  });

  describe("delete()", () => {
    it("should delete an existing refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(user.userId)
        .withGoogleId(user.googleId)
        .build();

      await userRepository.insert(user);
      await refreshTokenRepository.insert(refreshToken);

      const foundTokensBeforeDelete =
        await refreshTokenRepository.findManyByAnyId({
          userId: refreshToken.userId,
        });
      expect(foundTokensBeforeDelete).toHaveLength(1);

      await refreshTokenRepository.delete(refreshToken.refreshTokenId);
      const foundTokensAfterDelete =
        await refreshTokenRepository.findManyByAnyId({
          userId: refreshToken.userId,
        });
      expect(foundTokensAfterDelete).toHaveLength(0);
    });

    it("should throw NotFoundError when refresh token does not exist", async () => {
      const uuid = new Uuid();

      await expect(refreshTokenRepository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid.toString(), RefreshToken),
      );
    });
  });

  describe("findManyByAnyId()", () => {
    it("should return empty array when userId has no refresh tokens", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        userId: user.userId,
      });

      expect(foundTokens).toHaveLength(0);
    });

    it("should return empty array when googleId has no refresh tokens", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        googleId: user.googleId,
      });

      expect(foundTokens).toHaveLength(0);
    });

    it("should return all refresh tokens for a userId", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const [firstRefreshToken, secondRefreshToken] = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withUserId(user.userId)
        .build();

      await refreshTokenRepository.insert(firstRefreshToken);
      await refreshTokenRepository.insert(secondRefreshToken);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        userId: user.userId,
      });

      expect(foundTokens).toHaveLength(2);
      const ids = foundTokens.map((refreshToken) =>
        refreshToken.refreshTokenId.toString(),
      );
      expect(ids).toContain(firstRefreshToken.refreshTokenId.toString());
      expect(ids).toContain(secondRefreshToken.refreshTokenId.toString());
    });

    it("should return all refresh tokens for a googleId", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const [firstRefreshToken, secondRefreshToken] = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withUserId(user.userId)
        .withGoogleId(user.googleId)
        .build();

      await refreshTokenRepository.insert(firstRefreshToken);
      await refreshTokenRepository.insert(secondRefreshToken);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        googleId: user.googleId,
      });

      expect(foundTokens).toHaveLength(2);
      const ids = foundTokens.map((refreshToken) =>
        refreshToken.refreshTokenId.toString(),
      );
      expect(ids).toContain(firstRefreshToken.refreshTokenId.toString());
      expect(ids).toContain(secondRefreshToken.refreshTokenId.toString());
    });

    it("should not return tokens from other userIds", async () => {
      const firstUser = UserFactory.fake().oneUser().build();
      const secondUser = UserFactory.fake().oneUser().build();
      await userRepository.insert(firstUser);
      await userRepository.insert(secondUser);

      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(firstUser.userId)
        .build();
      await refreshTokenRepository.insert(refreshToken);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        userId: secondUser.userId,
      });

      expect(foundTokens).toHaveLength(0);
    });

    it("should not return tokens from other googleIds", async () => {
      const firstUser = UserFactory.fake().oneUser().build();
      const secondUser = UserFactory.fake().oneUser().build();
      await userRepository.insert(firstUser);
      await userRepository.insert(secondUser);

      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(firstUser.userId)
        .withGoogleId(firstUser.googleId)
        .build();
      await refreshTokenRepository.insert(refreshToken);

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        googleId: secondUser.googleId,
      });

      expect(foundTokens).toHaveLength(0);
    });
  });
});
