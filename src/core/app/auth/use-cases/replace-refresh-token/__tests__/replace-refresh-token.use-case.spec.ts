import { IUserRepository } from "@domain/user/user.repository";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { UserInMemoryRepository } from "@infra/user/db/in-memory/user-in-memory.repository";
import { RefreshTokenInMemoryRepository } from "@infra/refresh-token/db/in-memory/refresh-token-in-memory.repository";
import { UserFactory } from "@domain/user/user.entity";
import { ReplaceRefreshTokenUseCase } from "../replace-refresh-token.use-case";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

describe("Replace Refresh Token Use Case - Unit Tests", () => {
  let useCase: ReplaceRefreshTokenUseCase;
  let userRepository: IUserRepository;
  let refreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    userRepository = new UserInMemoryRepository();
    refreshTokenRepository = new RefreshTokenInMemoryRepository();
    useCase = new ReplaceRefreshTokenUseCase(refreshTokenRepository);
  });

  describe("execute()", () => {
    it("should replace the refresh token successfully", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      const oldToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(user.userId)
        .withGoogleId(user.googleId)
        .build();

      await refreshTokenRepository.insert(oldToken);

      await useCase.execute({
        refreshTokenIdToRemove: oldToken.refreshTokenId.toString(),
        newRefreshToken: "new-refresh-token",
        userId: user.userId.toString(),
        googleId: user.googleId,
      });

      const foundTokens = await refreshTokenRepository.findManyByAnyId({
        googleId: user.googleId,
      });

      expect(foundTokens).toHaveLength(1);
      expect(foundTokens[0].refreshTokenHash).not.toBe(
        oldToken.refreshTokenHash,
      );
    });

    it("should throw an error if the refresh token to remove does not exist", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      await expect(
        useCase.execute({
          refreshTokenIdToRemove: "550e8400-e29b-41d4-a716-446655440000",
          newRefreshToken: "new-refresh-token",
          userId: user.userId.toString(),
          googleId: user.googleId,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
