import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { GoogleLoginDto } from "./dtos/google-login.dto";
import { Public } from "../shared/decorators/public.decorator";
import type { Response } from "express";
import { RefreshTokenGuard } from "../shared/guards/refresh-token.guard";
import { ConfigService } from "@nestjs/config";
import { IAuthConfig } from "../configs/configs.interface";
import {
  CurrentSession,
  type ICurrentSession,
} from "../shared/decorators/current-session.decorator";
import { GoogleLoginUseCase } from "@app/auth/use-cases/google-login/google-login.use-case";
import { LogoutUseCase } from "@app/auth/use-cases/logout/logout.use-case";
import { ReplaceRefreshTokenUseCase } from "@app/auth/use-cases/replace-refresh-token/replace-refresh-token.use-case";
import { Serialize } from "../shared/interceptors/serialize.interceptor";
import { AuthSerializeDto } from "./dtos/auth-serialize.dto";

@Controller("auth")
@Serialize(AuthSerializeDto)
export class AuthController {
  constructor(
    private configService: ConfigService,
    private googleLoginUseCase: GoogleLoginUseCase,
    private logoutUseCase: LogoutUseCase,
    private replaceRefreshTokenUseCase: ReplaceRefreshTokenUseCase,
  ) {}

  @Public()
  @Post("google/login")
  async googleLogin(
    @Body() loginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.googleLoginUseCase.execute({
        token: loginDto.googleToken,
      });

    this.setAuthCookies({
      response,
      accessToken,
      refreshToken,
    });

    return {
      user,
    };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refreshTokens(
    @Res({ passthrough: true }) response: Response,
    @CurrentSession() session: ICurrentSession,
  ) {
    try {
      const { accessToken, refreshToken, user } =
        await this.replaceRefreshTokenUseCase.execute({
          userId: session.userId,
          refreshToken: session.refreshToken,
        });

      this.setAuthCookies({
        response,
        accessToken,
        refreshToken,
      });

      return {
        user,
      };
    } catch (e) {
      this.removeAuthCookies(response);
      throw e;
    }
  }

  @Post("logout")
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentSession() session: ICurrentSession,
  ) {
    await this.logoutUseCase.execute({
      refreshToken: session.refreshToken,
      userId: session.userId,
    });

    this.removeAuthCookies(response);
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
      secure: true,
      maxAge: authConfig.jwtExpirationTime * 1000,
      path: "/",
    });

    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: authConfig.jwtRefreshExpirationTime * 1000,
      path: "/auth/refresh",
    });
  }

  private removeAuthCookies(response: Response) {
    response.clearCookie("access_token", { path: "/" });
    response.clearCookie("refresh_token", { path: "/auth/refresh" });
  }
}
