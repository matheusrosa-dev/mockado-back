import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenInMemoryRepository } from "../refresh-token-in-memory.repository";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";

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

    it("should only delete the target refresh token when multiple refresh tokens exist", async () => {
      const refreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(3)
        .build();

      await Promise.all(refreshTokens.map((rt) => repository.insert(rt)));

      await repository.delete(refreshTokens[1].refreshTokenId as Uuid);

      expect(repository.items).toHaveLength(2);
      expect(
        repository.items.find((rt) =>
          rt.refreshTokenId.equals(refreshTokens[0].refreshTokenId),
        ),
      ).toBeDefined();
      expect(
        repository.items.find((rt) =>
          rt.refreshTokenId.equals(refreshTokens[1].refreshTokenId),
        ),
      ).toBeUndefined();
      expect(
        repository.items.find((rt) =>
          rt.refreshTokenId.equals(refreshTokens[2].refreshTokenId),
        ),
      ).toBeDefined();
    });

    it("should throw NotFoundError when refresh token does not exist", async () => {
      const uuid = new Uuid();

      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid, RefreshToken),
      );
    });
  });
});
