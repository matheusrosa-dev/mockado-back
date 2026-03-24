import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "../refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "../refresh-token-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("Refresh Token TypeOrm Repository - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
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

      const foundRefreshTokens = await refreshTokenRepository.findManyByUserId(
        refreshToken.userId,
      );

      expect(foundRefreshTokens).toHaveLength(1);

      expect(foundRefreshTokens[0]).toEqual({
        refreshTokenId: refreshToken.refreshTokenId.toString(),
        userId: refreshToken.userId.toString(),
        refreshTokenHash: refreshToken.refreshTokenHash,
        createdAt: refreshToken.createdAt,
        user: {
          userId: user.userId.toString(),
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
    });
  });

  describe("delete()", () => {
    it("should delete an existing refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();

      const refreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withUserId(user.userId)
        .build();

      await userRepository.insert(user);

      await Promise.all(
        refreshTokens.map((refreshToken) =>
          refreshTokenRepository.insert(refreshToken),
        ),
      );

      await refreshTokenRepository.delete(refreshTokens[0].refreshTokenId);

      const foundTokensAfterDelete =
        await refreshTokenRepository.findManyByUserId(user.userId);

      expect(foundTokensAfterDelete).toHaveLength(1);
      expect(foundTokensAfterDelete[0]).toEqual({
        refreshTokenId: refreshTokens[1].refreshTokenId.toString(),
        userId: refreshTokens[1].userId.toString(),
        refreshTokenHash: refreshTokens[1].refreshTokenHash,
        createdAt: refreshTokens[1].createdAt,
        user: {
          userId: user.userId.toString(),
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
    });

    it("should throw NotFoundError when refresh token does not exist", async () => {
      const uuid = new Uuid();

      await expect(refreshTokenRepository.delete(uuid)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("findManyByUserId()", () => {
    it("should return empty array when userId has no refresh tokens", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const foundTokens = await refreshTokenRepository.findManyByUserId(
        user.userId,
      );

      expect(foundTokens).toHaveLength(0);
    });

    it("should return all refresh tokens for a userId", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withUserId(user.userId)
        .build();

      await Promise.all(
        refreshTokens.map((refreshToken) =>
          refreshTokenRepository.insert(refreshToken),
        ),
      );

      const foundTokens = await refreshTokenRepository.findManyByUserId(
        user.userId,
      );

      expect(foundTokens).toHaveLength(2);

      foundTokens.forEach((refreshToken) => {
        const refreshTokenWithId = refreshTokens.find(
          (rt) => rt.refreshTokenId.toString() === refreshToken.refreshTokenId,
        );

        expect(refreshToken).toEqual({
          refreshTokenId: refreshTokenWithId!.refreshTokenId.toString(),
          userId: refreshTokenWithId!.userId.toString(),
          refreshTokenHash: refreshTokenWithId!.refreshTokenHash,
          createdAt: refreshTokenWithId!.createdAt,
          user: {
            userId: user.userId.toString(),
            name: user.name,
            email: user.email,
            isActive: user.isActive,
          },
        });
      });
    });

    it("should not return tokens from other userIds", async () => {
      const users = UserFactory.fake().manyUsers(2).build();

      await Promise.all(users.map((user) => userRepository.insert(user)));

      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(users[0].userId)
        .build();
      await refreshTokenRepository.insert(refreshToken);

      const foundTokens = await refreshTokenRepository.findManyByUserId(
        users[1].userId,
      );

      expect(foundTokens).toHaveLength(0);
    });
  });
});
