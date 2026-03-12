import { Body, Controller, Post } from "@nestjs/common";
import { GoogleLoginDto } from "./dtos/google-login.dto";
import { Public } from "../decorators/public.decorator";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("google/login")
  async googleLogin(@Body() loginDto: GoogleLoginDto) {
    return this.authService.googleLogin(loginDto);
  }
}
