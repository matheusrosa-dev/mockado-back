import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenExistsValidator } from "../refresh-token-exists.validator";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { BcryptHashService } from "@infra/auth/services/bcrypt-hash.service";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

describe("Refresh Token Exists Validator - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  let validator: RefreshTokenExistsValidator;
  let refreshTokenRepository: IRefreshTokenRepository;
  let userRepository: UserTypeOrmRepository;
  const hashService = new BcryptHashService();

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    validator = new RefreshTokenExistsValidator(
      refreshTokenRepository,
      hashService,
    );
  });

  describe("validate()", () => {
    it("should return result for a valid refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshTokenHash = await hashService.hash("refresh-token-123");

      const refreshTokenEntity = RefreshTokenFactory.create({
        refreshTokenHash,
        userId: user.userId,
      });

      await refreshTokenRepository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          userId: refreshTokenEntity.userId,
          refreshToken: "refresh-token-123",
        })
      ).asArray();

      expect(foundRefreshToken).toEqual({
        refreshTokenId: refreshTokenEntity.refreshTokenId.toString(),
        userId: refreshTokenEntity.userId.toString(),
        refreshTokenHash: refreshTokenEntity.refreshTokenHash,
        createdAt: refreshTokenEntity.createdAt,
        user: {
          userId: user.userId.toString(),
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
      expect(validationError).toBeNull();
    });

    it("should return error for an invalid refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshToken = "refresh-token-123";
      const refreshTokenHash = await hashService.hash(refreshToken);

      const refreshTokenEntity = RefreshTokenFactory.create({
        refreshTokenHash,
        userId: user.userId,
      });

      await refreshTokenRepository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          userId: refreshTokenEntity.userId,
          refreshToken: "invalid-refresh-token",
        })
      ).asArray();

      expect(validationError).toBeInstanceOf(NotFoundError);
      expect(foundRefreshToken).toBeNull();
    });

    it("should return error if there are no refresh tokens for the userId", async () => {
      const [foundRefreshToken, validationError] = (
        await validator.validate({
          userId: new Uuid(),
          refreshToken: "any-refresh-token",
        })
      ).asArray();

      expect(validationError).toBeInstanceOf(NotFoundError);
      expect(foundRefreshToken).toBeNull();
    });
  });
});
