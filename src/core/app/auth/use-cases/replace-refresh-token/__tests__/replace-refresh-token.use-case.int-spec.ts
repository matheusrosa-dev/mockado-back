import { IUserRepository } from "@domain/user/user.repository";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserFactory } from "@domain/user/user.entity";
import { ReplaceRefreshTokenUseCase } from "../replace-refresh-token.use-case";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { BcryptHashService } from "@infra/auth/services/bcrypt-hash.service";
import { JwtTokenService } from "@infra/auth/services/jwt-token.service";
import { AuthenticationError } from "@domain/shared/errors/authentication.error";
import { TypeOrmReplaceRefreshTokenUnitOfWork } from "@infra/auth/replace-refresh-token/typeorm-replace-refresh-token.unit-of-work";

describe("Replace Refresh Token Use Case - Integration Tests", () => {
  let useCase: ReplaceRefreshTokenUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService({
    jwtSecret: "test-secret",
    jwtExpirationTime: 3600,
    jwtRefreshExpirationTime: 86400,
    jwtRefreshSecret: "test-refresh-secret",
  });

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    useCase = new ReplaceRefreshTokenUseCase(
      new TypeOrmReplaceRefreshTokenUnitOfWork(dataSource),
      hashService,
      tokenService,
    );
  });

  describe("execute()", () => {
    it("should replace the refresh token successfully", async () => {
      const user = UserFactory.fake().oneUser().withIsActive(true).build();

      const refreshTokenHash = await hashService.hash("old-refresh-token");

      const oldToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(user.userId)
        .withRefreshTokenHash(refreshTokenHash)
        .build();

      await userRepository.insert(user);
      await refreshTokenRepository.insert(oldToken);

      const result = await useCase.execute({
        refreshToken: "old-refresh-token",
        userId: user.userId.toString(),
      });

      const foundTokens = await refreshTokenRepository.findManyByUserId(
        user.userId,
      );

      expect(foundTokens).toHaveLength(1);
      expect(foundTokens[0].refreshTokenHash).not.toBe(
        oldToken.refreshTokenHash,
      );

      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: user.userId.toString(),
          email: user.email,
          name: user.name,
        },
      });
    });

    it("should throw an error if the user account is inactive", async () => {
      const user = UserFactory.fake().oneUser().withIsActive(false).build();
      await userRepository.insert(user);

      await expect(
        useCase.execute({
          userId: user.userId.toString(),
          refreshToken: "non-existent-refresh-token",
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    it("should throw an error if the refresh token to revoke does not exist", async () => {
      const user = UserFactory.fake().oneUser().withIsActive(true).build();
      await userRepository.insert(user);

      await expect(
        useCase.execute({
          userId: user.userId.toString(),
          refreshToken: "non-existent-refresh-token",
        }),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
