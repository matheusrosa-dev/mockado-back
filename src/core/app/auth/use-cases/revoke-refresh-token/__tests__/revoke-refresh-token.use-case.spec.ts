import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenInMemoryRepository } from "@infra/refresh-token/db/in-memory/refresh-token-in-memory.repository";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { RevokeRefreshTokenUseCase } from "../revoke-refresh-token.use-case";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

describe("Revoke Refresh Token Use Case - Unit Tests", () => {
  let useCase: RevokeRefreshTokenUseCase;
  let refreshTokenRepository: IRefreshTokenRepository;

  beforeEach(() => {
    refreshTokenRepository = new RefreshTokenInMemoryRepository();
    useCase = new RevokeRefreshTokenUseCase(refreshTokenRepository);
  });

  describe("execute()", () => {
    it("should revoke the refresh token successfully", async () => {
      const oldToken = RefreshTokenFactory.fake().oneRefreshToken().build();

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
