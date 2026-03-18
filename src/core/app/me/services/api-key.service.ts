export interface IApiKeyService {
  generate(): {
    apiKey: string;
    apiKeyHash: string;
  };

  generateFromApiKey(apiKey: string): string;
}
