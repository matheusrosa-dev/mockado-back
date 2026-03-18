import { CryptoApiKeyService } from "../crypto-api-key.service";

describe("Crypto Api Key Service - Unit Tests", () => {
  const service = new CryptoApiKeyService();

  describe("generate()", () => {
    it("should return a string", () => {
      const result = service.generate();

      expect(typeof result.apiKey).toBe("string");
      expect(typeof result.apiKeyHash).toBe("string");
    });

    it("should return a hex string", () => {
      const result = service.generate();

      expect(result.apiKey).toMatch(/^[0-9a-f]+$/);
      expect(result.apiKeyHash).toMatch(/^[0-9a-f]+$/);
    });

    it("should return a string with 64 characters", () => {
      const result = service.generate();

      expect(result.apiKey).toHaveLength(64);
      expect(result.apiKeyHash).toHaveLength(64);
    });

    it("should generate unique values on each call", () => {
      const first = service.generate();
      const second = service.generate();

      expect(first).not.toBe(second);
      expect(first.apiKey).not.toBe(second.apiKey);
      expect(first.apiKeyHash).not.toBe(second.apiKeyHash);
    });
  });

  describe("generateFromApiKey()", () => {
    it("should return hex strings", () => {
      const apiKeyHash = service.generateFromApiKey(
        "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      );

      expect(apiKeyHash).toMatch(/^[0-9a-f]+$/);
    });

    it("should return an apiKeyHash with 64 characters", () => {
      const apiKeyHash = service.generateFromApiKey("c".repeat(64));

      expect(apiKeyHash).toHaveLength(64);
    });

    it("should return a deterministic hash for the same apiKey", () => {
      const apiKey = "d".repeat(64);
      const firstApiKeyHash = service.generateFromApiKey(apiKey);
      const secondApiKeyHash = service.generateFromApiKey(apiKey);

      expect(firstApiKeyHash).toBe(secondApiKeyHash);
    });

    it("should return different hashes for different apiKeys", () => {
      const firstApiKeyHash = service.generateFromApiKey("e".repeat(64));
      const secondApiKeyHash = service.generateFromApiKey("f".repeat(64));

      expect(firstApiKeyHash).not.toBe(secondApiKeyHash);
    });

    it("should produce the same hash as generate() for a key created by generate()", () => {
      const generated = service.generate();
      const apiKeyHash = service.generateFromApiKey(generated.apiKey);

      expect(apiKeyHash).toBe(generated.apiKeyHash);
    });
  });
});
