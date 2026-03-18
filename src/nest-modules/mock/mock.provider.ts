import { DataSource } from "typeorm";
import { FactoryProvider } from "@nestjs/common";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { MockEndpointUseCase } from "@app/endpoint/use-cases/mock-endpoint/mock-endpoint.use-case";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { CryptoApiKeyService } from "@infra/me/services/crypto-api-key.service";
import { IApiKeyService } from "@app/me/services/api-key.service";

const REPOSITORIES = {
  ENDPOINT: {
    provide: EndpointTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new EndpointTypeOrmRepository(dataSource),
    inject: [DataSource],
  } as FactoryProvider,
};

const SERVICES = {
  ENDPOINT: {
    provide: CryptoApiKeyService,
    useFactory: () => new CryptoApiKeyService(),
  } as FactoryProvider,
};

const USE_CASES = {
  MOCK_ENDPOINT: {
    provide: MockEndpointUseCase,
    useFactory: (
      endpointRepository: IEndpointRepository,
      apiKeyService: IApiKeyService,
    ) => {
      return new MockEndpointUseCase(endpointRepository, apiKeyService);
    },
    inject: [REPOSITORIES.ENDPOINT.provide, SERVICES.ENDPOINT.provide],
  } as FactoryProvider,
};

export const MOCK_PROVIDERS = {
  REPOSITORIES,
  SERVICES,
  USE_CASES,
};
