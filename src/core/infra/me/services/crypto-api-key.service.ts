import { IApiKeyService } from "@app/me/services/api-key.service";
import { randomBytes, createHash } from "node:crypto";

export class CryptoApiKeyService implements IApiKeyService {
  generate() {
    const apiKey = randomBytes(32).toString("hex");

    const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

    return {
      apiKey,
      apiKeyHash,
    };
  }

  generateFromApiKey(apiKey: string) {
    const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

    return apiKeyHash;
  }
}
