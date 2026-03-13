import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { IAuthConfig } from "../configs/configs.interface";
import { GoogleLoginUseCase } from "@app/auth/use-cases/google-login/google-login.use-case";
import { GoogleLoginDto } from "./dtos/google-login.dto";
import { RefreshTokenExistsValidator } from "@app/auth/validations/refresh-token-exists/refresh-token-exists.validator";
import { ICurrentSession } from "../shared/decorators/current-session.decorator";
import { ReplaceRefreshTokenUseCase } from "@app/auth/use-cases/replace-refresh-token/replace-refresh-token.use-case";
import { ReplaceRefreshTokenInput } from "@app/auth/use-cases/replace-refresh-token/replace-refresh-token.input";
import { validateSync } from "class-validator";
import { RevokeRefreshTokenUseCase } from "@app/auth/use-cases/revoke-refresh-token/revoke-refresh-token.use-case";

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  private clientId: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleLoginUseCase: GoogleLoginUseCase,
    private replaceRefreshTokenUseCase: ReplaceRefreshTokenUseCase,
    private revokeRefreshTokenUseCase: RevokeRefreshTokenUseCase,
    private refreshTokenExistsValidator: RefreshTokenExistsValidator,
  ) {
    const clientId = this.configService.get("auth.googleClientId") as string;

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
    } catch (e) {
      console.error("Error verifying Google token:", e);
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

  async refreshTokens(session: ICurrentSession) {
    const [foundRefreshToken, validationError] = (
      await this.refreshTokenExistsValidator.validate({
        googleId: session.googleId,
        refreshToken: session.refreshToken,
      })
    ).asArray();

    if (validationError) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const useCaseInput = new ReplaceRefreshTokenInput({
      googleId: foundRefreshToken.googleId,
      userId: foundRefreshToken.userId.toString(),
      refreshTokenIdToRevoke: foundRefreshToken.refreshTokenId.toString(),
      newRefreshToken: session.refreshToken,
    });

    const errors = validateSync(useCaseInput);

    if (errors.length) {
      console.error("Validation errors for ReplaceRefreshTokenInput: ", errors);
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.replaceRefreshTokenUseCase.execute(useCaseInput);

    const tokens = await this.getAuthTokens({
      name: session.name,
      email: session.email,
      googleId: session.googleId,
    });

    // TODO: RETORNAR NOVOS DADOS DO USUARIO

    return tokens;
  }

  async logout(session: ICurrentSession) {
    const [foundRefreshToken] = (
      await this.refreshTokenExistsValidator.validate({
        googleId: session.googleId,
        refreshToken: session.refreshToken,
      })
    ).asArray();

    if (foundRefreshToken) {
      await this.revokeRefreshTokenUseCase.execute({
        refreshTokenId: foundRefreshToken.refreshTokenId.toString(),
      });
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <Payload can be any>
  private async getAuthTokens(payload: any) {
    const authConfig = this.configService.get<IAuthConfig>("auth")!;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: authConfig.jwtSecret,
        expiresIn: authConfig.jwtExpirationTime,
      }),

      this.jwtService.signAsync(payload, {
        secret: authConfig.jwtRefreshSecret,
        expiresIn: authConfig.jwtRefreshExpirationTime,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
