import {
  GoogleLoginRepositories,
  IGoogleLoginUnitOfWork,
} from "@app/auth/use-cases/google-login/google-login.unit-of-work";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { DataSource } from "typeorm";

export class TypeOrmGoogleLoginUnitOfWork implements IGoogleLoginUnitOfWork {
  constructor(private dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (repositories: GoogleLoginRepositories) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction((manager) => {
      return work({
        userRepository: new UserTypeOrmRepository(manager),
        refreshTokenRepository: new RefreshTokenTypeOrmRepository(manager),
      });
    });
  }
}
