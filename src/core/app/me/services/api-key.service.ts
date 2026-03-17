export interface IApiKeyService {
  generate(): {
    apiKey: string;
    apiKeyHash: string;
  };
}
