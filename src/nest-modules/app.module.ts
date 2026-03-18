import { Module } from "@nestjs/common";
import { EndpointsModule } from "./endpoints/endpoints.module";
import { DatabasesModule } from "./databases/databases.module";
import { ConfigsModule } from "./configs/configs.module";
import { StatusCodesModule } from "./status-codes/status-codes.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./shared/guards/access-token.guard";
import { MeModule } from "./me/me.module";
import { MockModule } from "./mock/mock.module";

@Module({
  imports: [
    ConfigsModule,
    DatabasesModule,
    AuthModule,
    EndpointsModule,
    StatusCodesModule,
    MeModule,
    MockModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
