import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AUTH_PROVIDERS } from "./auth.provider";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenStrategy } from "./strategies/access-token.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...Object.values(AUTH_PROVIDERS.REPOSITORIES),
    ...Object.values(AUTH_PROVIDERS.USE_CASES),
    ...Object.values(AUTH_PROVIDERS.VALIDATORS),
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthService,
  ],
})
export class AuthModule {}
