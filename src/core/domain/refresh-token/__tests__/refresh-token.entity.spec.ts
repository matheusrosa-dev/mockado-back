/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { Uuid } from "../../shared/value-objects/uuid.vo";
import { RefreshTokenFactory, RefreshToken } from "../refresh-token.entity";

describe("Refresh Token Entity - Unit Tests", () => {
  describe("constructor", () => {
    it("should instance a refresh token with all properties", () => {
      const refreshTokenProps = {
        refreshTokenId: new Uuid(),
        userId: new Uuid(),
        refreshTokenHash: "refresh-token-hash",
        createdAt: new Date(),
      };

      const refreshToken = new RefreshToken(refreshTokenProps);

      expect(refreshToken).toBeInstanceOf(RefreshToken);
      expect(
        refreshToken.refreshTokenId.equals(refreshTokenProps.refreshTokenId),
      ).toBe(true);
      expect(refreshToken.userId.equals(refreshTokenProps.userId)).toBe(true);
      expect(refreshToken.refreshTokenHash).toBe(
        refreshTokenProps.refreshTokenHash,
      );
      expect(refreshToken.createdAt).toEqual(refreshTokenProps.createdAt);
    });

    it("should instance a refresh token with only required properties", () => {
      const refreshTokenProps = {
        userId: new Uuid(),
        refreshTokenHash: "refresh-token-hash",
      };

      const refreshToken = new RefreshToken(refreshTokenProps);

      expect(refreshToken).toBeInstanceOf(RefreshToken);
      expect(refreshToken.refreshTokenId).toBeInstanceOf(Uuid);
      expect(refreshToken.userId.equals(refreshTokenProps.userId)).toBe(true);
      expect(refreshToken.refreshTokenHash).toBe(
        refreshTokenProps.refreshTokenHash,
      );
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("entityId", () => {
    it("should return the entityId", () => {
      const id = new Uuid();
      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenId(id)
        .build();

      expect(refreshToken.entityId.equals(id)).toBe(true);
    });
  });

  describe("hashRefreshToken()", () => {
    it("should hash the refresh token", async () => {
      const refreshToken = "my-refresh-token";
      const hash = await RefreshToken.hashRefreshToken(refreshToken);

      expect(hash).not.toBe(refreshToken);
      expect(hash).toBeDefined();
    });
  });

  describe("compareHash()", () => {
    it("should return true for matching refresh token and hash", async () => {
      const refreshToken = "my-refresh-token";
      const hash = await RefreshToken.hashRefreshToken(refreshToken);

      const result = await RefreshToken.compareHash(refreshToken, hash);

      expect(result).toBe(true);
    });

    it("should return false for non-matching refresh token and hash", async () => {
      const refreshToken = "my-refresh-token";
      const hash = await RefreshToken.hashRefreshToken(refreshToken);

      const result = await RefreshToken.compareHash(
        "different-refresh-token",
        hash,
      );

      expect(result).toBe(false);
    });
  });

  describe("toJSON()", () => {
    it("should return a plain object with all fields", () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      expect(refreshToken.toJSON()).toEqual({
        refreshTokenId: refreshToken.refreshTokenId.toString(),
        userId: refreshToken.userId.toString(),
        refreshTokenHash: refreshToken.refreshTokenHash,
        createdAt: refreshToken.createdAt,
      });
    });
  });

  describe("validate()", () => {
    it("should call validate on create with factory", () => {
      const spyValidate = jest.spyOn(RefreshToken.prototype, "validate");

      RefreshTokenFactory.fake().oneRefreshToken().build();

      expect(spyValidate).toHaveBeenCalled();
    });

    it("should have no errors for valid props", () => {
      const refreshToken = RefreshTokenFactory.fake().oneRefreshToken().build();

      expect(refreshToken.notification.hasErrors()).toBe(false);
    });

    it("should add error when refreshTokenHash is empty", () => {
      const refreshToken = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenHash("")
        .build();

      expect(refreshToken.notification.hasErrors()).toBe(true);
      expect(refreshToken.notification.errors.size).toBe(1);
      expect(
        refreshToken.notification.errors.get("refreshTokenHash"),
      ).toContain("refreshTokenHash should not be empty");

      const refreshToken2 = RefreshTokenFactory.fake()
        .oneRefreshToken()
        .withRefreshTokenHash(null as any)
        .build();

      expect(refreshToken2.notification.hasErrors()).toBe(true);
      expect(refreshToken2.notification.errors.size).toBe(1);
      expect(
        refreshToken2.notification.errors.get("refreshTokenHash"),
      ).toContain("refreshTokenHash should not be empty");
    });
  });
});
