import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenInMemoryRepository } from "@infra/refresh-token/db/in-memory/refresh-token-in-memory.repository";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";
import bcrypt from "bcrypt";
import { RefreshTokenExistsValidator } from "../refresh-token-exists.validator";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

describe("Refresh Token Exists Validator - Unit Tests", () => {
  let validator: RefreshTokenExistsValidator;
  let repository: IRefreshTokenRepository;

  beforeEach(() => {
    repository = new RefreshTokenInMemoryRepository();
    validator = new RefreshTokenExistsValidator(repository);
  });

  describe("validate()", () => {
    it("should return refresh token entity for a valid refresh token", async () => {
      const refreshToken = "refresh-token-123";

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const refreshTokenEntity = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenHash(refreshTokenHash)
        .build();

      await repository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: refreshTokenEntity.googleId,
          refreshToken: refreshToken,
        })
      ).asArray();

      expect(foundRefreshToken).toBeInstanceOf(RefreshToken);
      expect(validationError).toBeNull();
    });

    it("should return error for an invalid refresh token", async () => {
      const refreshToken = "refresh-token-123";

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const refreshTokenEntity = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenHash(refreshTokenHash)
        .build();

      await repository.insert(refreshTokenEntity);

      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: refreshTokenEntity.googleId,
          refreshToken: "invalid-refresh-token",
        })
      ).asArray();

      expect(foundRefreshToken).toBeNull();
      expect(validationError).toBeInstanceOf(NotFoundError);
    });

    it("should return error if there are no refresh tokens for the googleId", async () => {
      const [foundRefreshToken, validationError] = (
        await validator.validate({
          googleId: "non-existent-google-id",
          refreshToken: "any-refresh-token",
        })
      ).asArray();

      expect(foundRefreshToken).toBeNull();
      expect(validationError).toBeInstanceOf(NotFoundError);
    });
  });
});
