import { DataSource } from "typeorm";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { GoogleLoginUseCase } from "@app/auth/use-cases/google-login/google-login.use-case";
import { FactoryProvider } from "@nestjs/common";
import { RefreshTokenExistsValidator } from "@app/auth/validations/refresh-token-exists/refresh-token-exists.validator";
import { ReplaceRefreshTokenUseCase } from "@app/auth/use-cases/replace-refresh-token/replace-refresh-token.use-case";
import {
  GOOGLE_LOGIN_UNIT_OF_WORK,
  IGoogleLoginUnitOfWork,
} from "@app/auth/use-cases/google-login/google-login.unit-of-work";
import { TypeOrmGoogleLoginUnitOfWork } from "@infra/auth/google-login/typeorm-google-login.unit-of-work";
import { RevokeRefreshTokenUseCase } from "@app/auth/use-cases/revoke-refresh-token/revoke-refresh-token.use-case";

const REPOSITORIES = {
  USER: {
    provide: UserTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new UserTypeOrmRepository(dataSource),
    inject: [DataSource],
  } as FactoryProvider,
  REFRESH_TOKEN: {
    provide: RefreshTokenTypeOrmRepository,
    useFactory: (dataSource: DataSource) =>
      new RefreshTokenTypeOrmRepository(dataSource),
    inject: [DataSource],
  } as FactoryProvider,
};

const UNIT_OF_WORKS = {
  GOOGLE_LOGIN: {
    provide: GOOGLE_LOGIN_UNIT_OF_WORK,
    useFactory: (dataSource: DataSource) => {
      return new TypeOrmGoogleLoginUnitOfWork(dataSource);
    },
    inject: [DataSource],
  } as FactoryProvider,
};

const USE_CASES = {
  GOOGLE_LOGIN: {
    provide: GoogleLoginUseCase,
    useFactory: (googleLoginUnitOfWork: IGoogleLoginUnitOfWork) => {
      return new GoogleLoginUseCase(googleLoginUnitOfWork);
    },
    inject: [UNIT_OF_WORKS.GOOGLE_LOGIN.provide],
  } as FactoryProvider,
  REPLACE_REFRESH_TOKEN: {
    provide: ReplaceRefreshTokenUseCase,
    useFactory: (refreshTokenRepository: IRefreshTokenRepository) => {
      return new ReplaceRefreshTokenUseCase(refreshTokenRepository);
    },
    inject: [REPOSITORIES.REFRESH_TOKEN.provide],
  },
  REVOKE_REFRESH_TOKEN: {
    provide: RevokeRefreshTokenUseCase,
    useFactory: (refreshTokenRepository: IRefreshTokenRepository) => {
      return new RevokeRefreshTokenUseCase(refreshTokenRepository);
    },
    inject: [REPOSITORIES.REFRESH_TOKEN.provide],
  },
};

const VALIDATORS = {
  REFRESH_TOKEN_EXISTS: {
    provide: RefreshTokenExistsValidator,
    useFactory: (refreshTokenRepository: IRefreshTokenRepository) => {
      return new RefreshTokenExistsValidator(refreshTokenRepository);
    },
    inject: [REPOSITORIES.REFRESH_TOKEN.provide],
  } as FactoryProvider,
};

export const AUTH_PROVIDERS = {
  REPOSITORIES,
  UNIT_OF_WORKS,
  USE_CASES,
  VALIDATORS,
};
