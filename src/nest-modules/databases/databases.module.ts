import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IDatabaseConfig } from "../configs/configs.interface";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.get<IDatabaseConfig>("database")!;

        const entitiesPath = join(__dirname, "../../core/**/*.model{.ts,.js}");

        if (databaseConfig.type === "sqlite") {
          return {
            type: "sqlite",
            database: databaseConfig.database,
            entities: [entitiesPath],
            synchronize: true,
          };
        }

        if (databaseConfig.type === "postgres") {
          return {
            type: databaseConfig.type,
            host: databaseConfig.host,
            port: databaseConfig.port,
            username: databaseConfig.username,
            password: databaseConfig.password,
            database: databaseConfig.database,
            entities: [entitiesPath],

            migrationsRun: databaseConfig.migrationsRun,
            migrations: [
              join(
                __dirname,
                "../../core/infra/shared/db/typeorm/migrations/*{.ts,.js}",
              ),
            ],
          };
        }

        throw new Error("Unsupported database type");
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabasesModule {}
