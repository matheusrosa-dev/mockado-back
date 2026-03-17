import { CryptoApiKeyService } from "../crypto-api-key.service";

describe("Crypto Api Key Service - Unit Tests", () => {
  let service: CryptoApiKeyService;

  beforeEach(() => {
    service = new CryptoApiKeyService();
  });

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
});
