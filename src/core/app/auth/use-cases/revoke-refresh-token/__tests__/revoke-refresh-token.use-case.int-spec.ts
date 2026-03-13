import { IUserRepository } from "@domain/user/user.repository";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserFactory } from "@domain/user/user.entity";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { RevokeRefreshTokenUseCase } from "../revoke-refresh-token.use-case";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";

describe("Revoke Refresh Token Use Case - Integration Tests", () => {
  let useCase: RevokeRefreshTokenUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel],
  });

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    useCase = new RevokeRefreshTokenUseCase(refreshTokenRepository);
  });

  describe("execute()", () => {
    it("should revoke the refresh token successfully", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      const oldToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(user.userId)
        .withGoogleId(user.googleId)
        .build();

      await refreshTokenRepository.insert(oldToken);

      const foundTokensBeforeDelete =
        await refreshTokenRepository.findManyByAnyId({
          googleId: oldToken.googleId,
        });

      expect(foundTokensBeforeDelete).toHaveLength(1);

      await useCase.execute({
        refreshTokenId: oldToken.refreshTokenId.toString(),
      });

      const foundTokensAfterDelete =
        await refreshTokenRepository.findManyByAnyId({
          googleId: oldToken.googleId,
        });

      expect(foundTokensAfterDelete).toHaveLength(0);
    });

    it("should throw an error if the refresh token to revoke does not exist", async () => {
      await expect(
        useCase.execute({
          refreshTokenId: new Uuid().toString(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
