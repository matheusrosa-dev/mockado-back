import { Module } from "@nestjs/common";
import { EndpointsModule } from "./endpoints/endpoints.module";
import { DatabasesModule } from "./databases/databases.module";
import { ConfigsModule } from "./configs/configs.module";
import { StatusCodesModule } from "./status-codes/status-codes.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./guards/access-token.guard";

@Module({
  imports: [
    ConfigsModule,
    DatabasesModule,
    AuthModule,
    EndpointsModule,
    StatusCodesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
