import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  apiConfig,
  databaseConfig,
  authConfig,
  validationSchema,
} from "./env-config";
import { join } from "node:path";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig, databaseConfig, authConfig],
      isGlobal: true,
      envFilePath: [join(process.cwd(), `.env`)],
      validationSchema,
    }),
  ],
})
export class ConfigsModule {}
