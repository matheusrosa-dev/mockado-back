import { IUserRepository } from "@domain/user/user.repository";
import { GoogleLoginUseCase } from "../google-login.use-case";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserFactory } from "@domain/user/user.entity";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

describe("Google Login Use Case - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel],
  });

  let useCase: GoogleLoginUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
    useCase = new GoogleLoginUseCase(userRepository, refreshTokenRepository);
  });

  describe("execute()", () => {
    it("should log in an existing user and hash a refreshToken", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      const result = await useCase.execute({
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        refreshToken: "refresh-token-123",
      });

      expect(result).toEqual({
        userId: user.userId.toString(),
        email: user.email,
        name: user.name,
        googleId: user.googleId,
      });

      const storedTokens = await refreshTokenRepository.findManyByUserId(
        user.userId,
      );
      expect(storedTokens).toHaveLength(1);
      expect(typeof storedTokens[0].refreshTokenHash).toBe("string");
      expect(storedTokens[0].refreshTokenHash).not.toBe("refresh-token-123");
    });

    it("should create a new user and hash a refreshToken", async () => {
      const user = UserFactory.fake().oneUser().build();

      const result = await useCase.execute({
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        refreshToken: "refresh-token-456",
      });

      expect(result).toEqual({
        userId: expect.any(String),
        email: user.email,
        name: user.name,
        googleId: user.googleId,
      });

      const storedTokens = await refreshTokenRepository.findManyByUserId(
        new Uuid(result.userId),
      );

      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].refreshTokenHash).not.toBe("refresh-token-456");
    });

    it("should update user name and email if they differ from input", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withName("Old Name")
        .withEmail("oldemail@example.com")
        .build();

      await userRepository.insert(user);

      const result = await useCase.execute({
        googleId: user.googleId,
        email: "newemail@example.com",
        name: "New Name",
        refreshToken: "refresh-token-789",
      });

      expect(result).toEqual({
        userId: user.userId.toString(),
        email: "newemail@example.com",
        name: "New Name",
        googleId: user.googleId,
      });

      const updatedUser = await userRepository.findByGoogleId(user.googleId);
      expect(updatedUser?.name).toBe("New Name");
      expect(updatedUser?.email).toBe("newemail@example.com");
    });

    it("should throw EntityValidationError when input is not valid", async () => {
      await expect(
        useCase.execute({
          googleId: "", // Invalid: empty googleId
          email: "", // Invalid: empty email
          name: "Invalid User",
          refreshToken: "refresh-token-invalid",
        }),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should return formatted output", async () => {
      const output = await useCase.execute({
        googleId: "1".repeat(21),
        email: "formatted@example.com",
        name: "Formatted User",
        refreshToken: "refresh-token-789",
      });

      expect(output).toEqual({
        userId: expect.any(String),
        email: "formatted@example.com",
        name: "Formatted User",
        googleId: "1".repeat(21),
      });
    });
  });
});
