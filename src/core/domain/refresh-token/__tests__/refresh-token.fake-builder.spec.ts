import { Uuid } from "../../shared/value-objects/uuid.vo";
import { RefreshTokenFactory } from "../refresh-token.entity";

describe("Refresh Token Fake Builder - Unit Tests", () => {
  describe("one refresh token", () => {
    it("should instance a fake refresh token with default values", () => {
      const fakeRefreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .build();

      expect(fakeRefreshToken.refreshTokenId.toString()).toBeDefined();
      expect(fakeRefreshToken.userId.toString()).toBeDefined();
      expect(fakeRefreshToken.refreshTokenHash).toBeDefined();
      expect(fakeRefreshToken.createdAt).toBeDefined();
    });

    it("should instance a fake refresh token with custom values", () => {
      const id = new Uuid();
      const userId = new Uuid();

      const fakeRefreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenId(id)
        .withUserId(userId)
        .withRefreshTokenHash("custom-hash-string")
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeRefreshToken.refreshTokenId.equals(id)).toBeTruthy();
      expect(fakeRefreshToken.userId.equals(userId)).toBeTruthy();
      expect(fakeRefreshToken.refreshTokenHash).toBe("custom-hash-string");
      expect(fakeRefreshToken.createdAt).toEqual(new Date("2024-01-01"));
    });

    it("should instance fake refresh tokens with factory functions as values", () => {
      const fakeRefreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenId(() => new Uuid())
        .withUserId(() => new Uuid())
        .withRefreshTokenHash(() => "factory-hash")
        .withCreatedAt(() => new Date("2025-06-15"))
        .build();

      expect(fakeRefreshToken.refreshTokenId.toString()).toBeDefined();
      expect(fakeRefreshToken.userId.toString()).toBeDefined();
      expect(fakeRefreshToken.refreshTokenHash).toBe("factory-hash");
      expect(fakeRefreshToken.createdAt).toEqual(new Date("2025-06-15"));
    });
  });

  describe("many refresh tokens", () => {
    it("should instance an array of fake refresh tokens with default values", () => {
      const amount = 5;
      const fakeRefreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(amount)
        .build();

      expect(fakeRefreshTokens).toHaveLength(amount);
      fakeRefreshTokens.forEach((refreshToken) => {
        expect(refreshToken.refreshTokenId.toString()).toBeDefined();
        expect(refreshToken.userId.toString()).toBeDefined();
        expect(refreshToken.refreshTokenHash).toBeDefined();
        expect(refreshToken.createdAt).toBeDefined();
      });
    });

    it("should instance an array of fake refresh tokens with custom values", () => {
      const id = new Uuid();
      const userId = new Uuid();
      const amount = 3;

      const fakeRefreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(amount)
        .withRefreshTokenId(id)
        .withUserId(userId)
        .withRefreshTokenHash("custom-hash-string")
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeRefreshTokens).toHaveLength(amount);
      fakeRefreshTokens.forEach((refreshToken) => {
        expect(refreshToken.refreshTokenId.equals(id)).toBeTruthy();
        expect(refreshToken.userId.equals(userId)).toBeTruthy();
        expect(refreshToken.refreshTokenHash).toBe("custom-hash-string");
        expect(refreshToken.createdAt).toEqual(new Date("2024-01-01"));
      });
    });

    it("should instance an array of fake refresh tokens with factory functions as values", () => {
      const amount = 3;

      const fakeRefreshTokens = RefreshTokenFactory.fake()
        .manyRefreshTokens(amount)
        .withRefreshTokenHash(() => "factory-hash")
        .withCreatedAt(() => new Date("2025-06-15"))
        .build();

      expect(fakeRefreshTokens).toHaveLength(amount);
      fakeRefreshTokens.forEach((refreshToken) => {
        expect(refreshToken.refreshTokenHash).toBe("factory-hash");
        expect(refreshToken.createdAt).toEqual(new Date("2025-06-15"));
      });
    });
  });
});
