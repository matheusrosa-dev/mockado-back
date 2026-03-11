import { IUserRepository } from "@domain/user/user.repository";
import { GoogleLoginUseCase } from "../google-login.use-case";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserInMemoryRepository } from "@infra/user/db/in-memory/user-in-memory.repository";
import { RefreshTokenInMemoryRepository } from "@infra/refresh-token/db/in-memory/refresh-token-in-memory.repository";
import { UserFactory } from "@domain/user/user.entity";
import { EntityValidationError } from "@domain/shared/validators/validation.error";

describe("Google Login Use Case - Unit Tests", () => {
  let useCase: GoogleLoginUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    userRepository = new UserInMemoryRepository();
    refreshTokenRepository = new RefreshTokenInMemoryRepository();
    useCase = new GoogleLoginUseCase(userRepository, refreshTokenRepository);
  });

  describe("execute()", () => {
    it("should log in an existing user and hash a refreshToken", async () => {
      const user = UserFactory.fake()
        .oneUser()
        .withGoogleId("google-123")
        .build();

      await userRepository.insert(user);

      const result = await useCase.execute({
        googleId: "google-123",
        email: "user@example.com",
        name: "Test User",
        picture: "http://example.com/picture.jpg",
        refreshToken: "refresh-token-123",
      });

      expect(result).toEqual({
        userId: user.userId.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        isActive: user.isActive,
      });

      const storedTokens = (
        refreshTokenRepository as RefreshTokenInMemoryRepository
      ).items;
      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].refreshTokenHash).not.toBe("refresh-token-123");
    });

    it("should create a new user and hash a refreshToken", async () => {
      const result = await useCase.execute({
        googleId: "1".repeat(21),
        email: "newuser@example.com",
        name: "New User",
        picture: "http://example.com/new-picture.jpg",
        refreshToken: "refresh-token-456",
      });

      expect(result).toEqual({
        userId: expect.any(String),
        email: "newuser@example.com",
        name: "New User",
        picture: "http://example.com/new-picture.jpg",
        isActive: true,
      });

      const storedTokens = (
        refreshTokenRepository as RefreshTokenInMemoryRepository
      ).items;
      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].refreshTokenHash).not.toBe("refresh-token-456");
    });

    it("should throw EntityValidationError when input is not valid", async () => {
      await expect(
        useCase.execute({
          googleId: "", // Invalid: empty googleId
          email: "", // Invalid: empty email
          name: "Invalid User",
          picture: "http://example.com/invalid-picture.jpg",
          refreshToken: "refresh-token-invalid",
        }),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should return formatted output", async () => {
      const output = await useCase.execute({
        googleId: "1".repeat(21),
        email: "formatted@example.com",
        name: "Formatted User",
        picture: "http://example.com/formatted-picture.jpg",
        refreshToken: "refresh-token-789",
      });

      expect(output).toEqual({
        userId: expect.any(String),
        email: "formatted@example.com",
        name: "Formatted User",
        picture: "http://example.com/formatted-picture.jpg",
        isActive: true,
      });
    });
  });
});
