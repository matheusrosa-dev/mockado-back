import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { IAuthConfig } from "../configs/configs.interface";
import { GoogleLoginUseCase } from "@app/auth/google-login/google-login.use-case";
import { GoogleLoginDto } from "./dtos/google-login.dto";

@Injectable()
export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private client: OAuth2Client;
  private clientId: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleLoginUseCase: GoogleLoginUseCase,
  ) {
    const authConfig = this.configService.get<IAuthConfig>("auth")!;
    const clientId = this.configService.get("auth.googleClientId") as string;

    this.jwtSecret = authConfig.jwtSecret;
    this.jwtRefreshSecret = authConfig.jwtRefreshSecret;

    this.clientId = clientId;

    this.client = new OAuth2Client(clientId);
  }

  async googleLogin(loginDto: GoogleLoginDto) {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: loginDto.googleToken,
        audience: this.clientId,
      });

      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Invalid Google token");
    }

    if (!payload) {
      throw new UnauthorizedException("Invalid Google token");
    }

    const { accessToken, refreshToken } = await this.getAuthTokens({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
    });

    const output = await this.googleLoginUseCase.execute({
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name!,
      refreshToken,
    });

    return {
      user: {
        id: output.userId,
        name: output.name,
        email: output.email,
        googleId: output.googleId,
      },
      accessToken,
      refreshToken,
    };
  }

  private async getAuthTokens(payload: any) {
    // TODO: add to env
    const oneWeek = 60 * 60 * 24 * 7;
    const fifteenMinutes = 60 * 15;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: fifteenMinutes,
      }),

      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: oneWeek,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
