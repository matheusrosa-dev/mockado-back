import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenExistsValidator } from "../refresh-token-exists.validator";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";
import bcrypt from "bcrypt";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { UserFactory } from "@domain/user/user.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("Refresh Token Exists Validator - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  let validator: RefreshTokenExistsValidator;
  let refreshTokenRepository: IRefreshTokenRepository;
  let userRepository: UserTypeOrmRepository;

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    validator = new RefreshTokenExistsValidator(refreshTokenRepository);
  });

  describe("validate()", () => {
    it("should return true for a valid refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshToken = "refresh-token-123";
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const refreshTokenEntity = RefreshTokenFactory.create({
        googleId: user.googleId,
        refreshTokenHash,
        userId: user.userId,
      });

      await refreshTokenRepository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: refreshTokenEntity.googleId,
          refreshToken: refreshToken,
        })
      ).asArray();

      expect(foundRefreshToken).toBeInstanceOf(RefreshToken);
      expect(validationError).toBeNull();
    });

    it("should return false for an invalid refresh token", async () => {
      const user = UserFactory.fake().oneUser().build();
      await userRepository.insert(user);

      const refreshToken = "refresh-token-123";
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const refreshTokenEntity = RefreshTokenFactory.create({
        googleId: user.googleId,
        refreshTokenHash,
        userId: user.userId,
      });

      await refreshTokenRepository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: refreshTokenEntity.googleId,
          refreshToken: "invalid-refresh-token",
        })
      ).asArray();

      expect(validationError).toBeInstanceOf(NotFoundError);
      expect(foundRefreshToken).toBeNull();
    });

    it("should return false if there are no refresh tokens for the googleId", async () => {
      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: "non-existent-google-id",
          refreshToken: "any-refresh-token",
        })
      ).asArray();

      expect(validationError).toBeInstanceOf(NotFoundError);
      expect(foundRefreshToken).toBeNull();
    });
  });
});
