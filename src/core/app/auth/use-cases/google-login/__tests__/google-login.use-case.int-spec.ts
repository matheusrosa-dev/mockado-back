import { IUserRepository } from "@domain/user/user.repository";
import { GoogleLoginUseCase } from "../google-login.use-case";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserFactory } from "@domain/user/user.entity";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { TypeOrmGoogleLoginUnitOfWork } from "@infra/auth/google-login/typeorm-google-login.unit-of-work";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { JwtTokenService } from "@infra/auth/services/jwt-token.service";
import { IGoogleAuthService } from "@app/auth/services/google-auth.service";
import { BcryptHashService } from "@infra/auth/services/bcrypt-hash.service";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { AuthenticationError } from "@domain/shared/errors/authentication.error";

class FakeGoogleAuthService implements IGoogleAuthService {
  verifyToken() {
    return Promise.resolve({
      googleId: "1".repeat(21),
      email: "fake@email.com",
      name: "Fake User",
    });
  }
}

describe("Google Login Use Case - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  let useCase: GoogleLoginUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  const hashService = new BcryptHashService();
  const googleAuthService = new FakeGoogleAuthService();
  const tokenService = new JwtTokenService({
    jwtSecret: "test-secret",
    jwtExpirationTime: 3600,
    jwtRefreshExpirationTime: 86400,
    jwtRefreshSecret: "test-refresh-secret",
  });

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    useCase = new GoogleLoginUseCase(
      new TypeOrmGoogleLoginUnitOfWork(dataSource),
      tokenService,
      googleAuthService,
      hashService,
    );
  });

  describe("execute()", () => {
    it("should log in an existing user and hash a refreshToken", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withIsActive(true)
        .withGoogleId("1".repeat(21))
        .withEmail("fake@email.com")
        .withName("Fake User")
        .build();

      await userRepository.insert(user);

      const result = await useCase.execute({
        token: "fake-token",
      });

      expect(result).toEqual({
        user: {
          id: user.userId.toString(),
          email: user.email,
          name: user.name,
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      const storedTokens = await refreshTokenRepository.findManyByUserId(
        user.userId,
      );

      expect(storedTokens).toHaveLength(1);
      expect(typeof storedTokens[0].refreshTokenHash).toBe("string");
    });

    it("should create a new user and hash a refreshToken", async () => {
      const result = await useCase.execute({
        token: "fake-token",
      });

      expect(result).toEqual({
        user: {
          id: expect.any(String),
          email: "fake@email.com",
          name: "Fake User",
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      const storedTokens = await refreshTokenRepository.findManyByUserId(
        new Uuid(result.user.id),
      );

      expect(storedTokens).toHaveLength(1);
      expect(typeof storedTokens[0].refreshTokenHash).toBe("string");
    });

    it("should throw an error if the user account is inactive", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withIsActive(false)
        .withGoogleId("1".repeat(21))
        .withEmail("fake@email.com")
        .withName("Fake User")
        .build();

      await userRepository.insert(user);

      await expect(
        useCase.execute({
          token: "fake-token",
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    it("should update user name and email if they differ from input", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withGoogleId("1".repeat(21))
        .build();

      await userRepository.insert(user);

      await useCase.execute({
        token: "fake-token",
      });

      const updatedUser = await userRepository.findByGoogleId(user.googleId);
      expect(updatedUser!.name).toBe("Fake User");
      expect(updatedUser!.email).toBe("fake@email.com");
    });
  });
});
