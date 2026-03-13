import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { GoogleLoginDto } from "./dtos/google-login.dto";
import { Public } from "../shared/decorators/public.decorator";
import { AuthService } from "./auth.service";
import type { Response } from "express";
import { RefreshTokenGuard } from "../shared/guards/refresh-token.guard";
import { ConfigService } from "@nestjs/config";
import { IAuthConfig } from "../configs/configs.interface";
import {
  CurrentSession,
  type ICurrentSession,
} from "../shared/decorators/current-session.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post("google/login")
  async googleLogin(
    @Body() loginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const {
      accessToken,
      refreshToken,
      user: output,
    } = await this.authService.googleLogin(loginDto);

    this.setAuthCookies({
      response,
      accessToken,
      refreshToken,
    });

    // TODO: ADICIONAR AQUELES TRANSFORM PRA LIMITAR CAMPOS A SEREM RETORNADOS

    return output;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
    @CurrentSession() session: ICurrentSession,
  ) {
    const tokens = await this.authService.refreshTokens(session);

    this.setAuthCookies({
      response: res,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  private setAuthCookies(props: {
    response: Response;
    accessToken: string;
    refreshToken: string;
  }) {
    const { response, accessToken, refreshToken } = props;

    const authConfig = this.configService.get<IAuthConfig>("auth")!;

    response.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: authConfig.jwtExpirationTime * 1000,
    });

    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: authConfig.jwtRefreshExpirationTime * 1000,
      path: "/auth/refresh",
    });
  }
}
