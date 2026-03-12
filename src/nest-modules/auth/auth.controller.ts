import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GoogleLoginDto } from "./dtos/google-login.dto";
import { GoogleLoginUseCase } from "@app/auth/google-login/google-login.use-case";

@Controller("auth")
export class AuthController {
  private client: OAuth2Client;
  private clientId: string;

  constructor(
    configService: ConfigService,
    private googleLoginUseCase: GoogleLoginUseCase,
  ) {
    const clientId = configService.get("googleAuth.clientId") as string;
    this.clientId = clientId;

    this.client = new OAuth2Client(clientId);
  }

  @Post("google/login")
  async googleLogin(@Body() loginDto: GoogleLoginDto) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: loginDto.googleToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException("Invalid Google token");
      }

      return this.googleLoginUseCase.execute({
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        refreshToken: "token",
      });
    } catch {
      throw new UnauthorizedException("Invalid Google token");
    }
  }
}
