import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(configService: ConfigService) {
    const jwtRefreshSecret = configService.get(
      "auth.jwtRefreshSecret",
    ) as string;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload) {
    const authorization = req.get("authorization");

    if (authorization) {
      const refreshToken = authorization.replace("Bearer", "").trim();

      return {
        ...payload,
        refreshToken,
      };
    }

    return payload;
  }
}
