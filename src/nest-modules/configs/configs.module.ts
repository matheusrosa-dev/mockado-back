import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { apiConfig, databaseConfig, validationSchema } from "./env-config";
import { join } from "node:path";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig, databaseConfig],
      isGlobal: true,
      envFilePath: [join(process.cwd(), "envs", `.env`)],
      validationSchema,
    }),
  ],
})
export class ConfigsModule {}
