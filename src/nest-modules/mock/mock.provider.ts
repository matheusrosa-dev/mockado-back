import { DataSource } from "typeorm";
import { FactoryProvider } from "@nestjs/common";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { MockEndpointUseCase } from "@app/endpoint/use-cases/mock-endpoint/mock-endpoint.use-case";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";

const REPOSITORIES = {
  ENDPOINT: {
    provide: EndpointTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new EndpointTypeOrmRepository(dataSource),
    inject: [DataSource],
  } as FactoryProvider,
};

const USE_CASES = {
  MOCK_ENDPOINT: {
    provide: MockEndpointUseCase,
    useFactory: (endpointRepository: IEndpointRepository) => {
      return new MockEndpointUseCase(endpointRepository);
    },
    inject: [REPOSITORIES.ENDPOINT.provide],
  } as FactoryProvider,
};

export const MOCK_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
