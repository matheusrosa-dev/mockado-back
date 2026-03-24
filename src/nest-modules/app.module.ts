import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { EndpointsModule } from "./endpoints/endpoints.module";
import { DatabasesModule } from "./databases/databases.module";
import { ConfigsModule } from "./configs/configs.module";
import { StatusCodesModule } from "./status-codes/status-codes.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./shared/guards/access-token.guard";
import { MockModule } from "./mock/mock.module";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // segundos em ms
          limit: 100, // número de requisições permitidas por ttl
        },
      ],
    }),
    ConfigsModule,
    DatabasesModule,
    AuthModule,
    EndpointsModule,
    StatusCodesModule,
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
