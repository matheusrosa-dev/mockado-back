import { CreateEndpointUseCase } from "@app/endpoint/create-endpoint/create-endpoint.use-case";
import { UpdateEndpointUseCase } from "@app/endpoint/update-endpoint/update-endpoint.use-case";
import { FindEndpointUseCase } from "@app/endpoint/find-endpoint/find-endpoint.use-case";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { FactoryProvider } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ListEndpointsSummaryUseCase } from "@app/endpoint/list-endpoints-summary/list-endpoints-summary.use-case";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { IUserRepository } from "@domain/user/user.repository";

const REPOSITORIES = {
  ENDPOINT: {
    provide: EndpointTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new EndpointTypeOrmRepository(dataSource),
    inject: [DataSource],
  } as FactoryProvider,

  USER: {
    provide: UserTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new UserTypeOrmRepository(dataSource),
    inject: [DataSource],
  },
};

const USE_CASES = {
  CREATE_ENDPOINT: {
    provide: CreateEndpointUseCase,
    useFactory: (
      endpointRepository: IEndpointRepository,
      userRepository: IUserRepository,
    ) => new CreateEndpointUseCase(endpointRepository, userRepository),
    inject: [REPOSITORIES.ENDPOINT.provide, REPOSITORIES.USER.provide],
  } as FactoryProvider,

  UPDATE_ENDPOINT: {
    provide: UpdateEndpointUseCase,
    useFactory: (endpointRepository: IEndpointRepository) =>
      new UpdateEndpointUseCase(endpointRepository),
    inject: [REPOSITORIES.ENDPOINT.provide],
  } as FactoryProvider,

  FIND_ENDPOINT: {
    provide: FindEndpointUseCase,
    useFactory: (endpointRepository: IEndpointRepository) =>
      new FindEndpointUseCase(endpointRepository),
    inject: [REPOSITORIES.ENDPOINT.provide],
  } as FactoryProvider,

  LIST_ENDPOINTS_SUMMARY: {
    provide: ListEndpointsSummaryUseCase,
    useFactory: (endpointRepository: IEndpointRepository) =>
      new ListEndpointsSummaryUseCase(endpointRepository),
    inject: [REPOSITORIES.ENDPOINT.provide],
  } as FactoryProvider,
};

export const ENDPOINT_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
