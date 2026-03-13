import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenInMemoryRepository } from "../refresh-token-in-memory.repository";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

describe("Refresh Token In Memory Repository - Unit Tests", () => {
  let repository: RefreshTokenInMemoryRepository;

  beforeEach(() => {
    repository = new RefreshTokenInMemoryRepository();
  });

  describe("getEntity()", () => {
    it("should return the RefreshToken constructor", () => {
      expect(repository.getEntity()).toBe(RefreshToken);
    });
  });

  describe("insert()", () => {
    it("should insert a refresh token", async () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();
      await repository.insert(refreshToken);

      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toBe(refreshToken);
    });

    it("should accumulate multiple inserted refresh tokens", async () => {
      const refreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(3)
        .build();

      for (const refreshToken of refreshTokens) {
        await repository.insert(refreshToken);
      }

      expect(repository.items).toHaveLength(3);
    });
  });

  describe("delete()", () => {
    it("should delete an existing refresh token", async () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      await repository.insert(refreshToken);

      await repository.delete(refreshToken.refreshTokenId as Uuid);
      expect(repository.items).toHaveLength(0);
    });

    it("should throw NotFoundError when refresh token does not exist", async () => {
      const uuid = new Uuid();

      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid.toString(), RefreshToken),
      );
    });
  });

  describe("findManyByAnyId()", () => {
    it("should return empty array when userId has no refresh tokens", async () => {
      const userId = new Uuid();

      const foundTokens = await repository.findManyByAnyId({
        userId,
      });

      expect(foundTokens).toHaveLength(0);
    });

    it("should return empty array when googleId has no refresh tokens", async () => {
      const foundTokens = await repository.findManyByAnyId({
        googleId: "non-existent-google-id",
      });

      expect(foundTokens).toHaveLength(0);
    });

    it("should return all refresh tokens for a userId", async () => {
      const userId = new Uuid();

      const [firstRefreshToken, secondRefreshToken] = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withUserId(userId)
        .build();

      await repository.insert(firstRefreshToken);
      await repository.insert(secondRefreshToken);

      const foundTokens = await repository.findManyByAnyId({
        userId,
      });

      expect(foundTokens).toHaveLength(2);
      const ids = foundTokens.map((refreshToken) =>
        refreshToken.refreshTokenId.toString(),
      );
      expect(ids).toContain(firstRefreshToken.refreshTokenId.toString());
      expect(ids).toContain(secondRefreshToken.refreshTokenId.toString());
    });

    it("should return all refresh tokens for a googleId", async () => {
      const googleId = "test-google-id";

      const [firstRefreshToken, secondRefreshToken] = RefreshTokenFactory.fake()
        .manyRefreshTokens(2)
        .withGoogleId(googleId)
        .build();

      await repository.insert(firstRefreshToken);
      await repository.insert(secondRefreshToken);

      const foundTokens = await repository.findManyByAnyId({
        googleId,
      });

      expect(foundTokens).toHaveLength(2);
      const ids = foundTokens.map((refreshToken) =>
        refreshToken.refreshTokenId.toString(),
      );
      expect(ids).toContain(firstRefreshToken.refreshTokenId.toString());
      expect(ids).toContain(secondRefreshToken.refreshTokenId.toString());
    });

    it("should not return tokens from other userIds", async () => {
      const userId = new Uuid();

      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withUserId(userId)
        .build();

      await repository.insert(refreshToken);

      const foundTokens = await repository.findManyByAnyId({
        userId: new Uuid(),
      });

      expect(foundTokens).toHaveLength(0);
    });
  });
});
