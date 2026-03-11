import { IUseCase } from "@app/shared/use-case.interface";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { IUserRepository } from "@domain/user/user.repository";
import { GoogleLoginInput } from "./google-login.input";
import {
  RefreshToken,
  RefreshTokenFactory,
} from "@domain/refresh-token/refresh-token.entity";
import { UserFactory } from "@domain/user/user.entity";
import bcrypt from "bcrypt";

export class GoogleLoginUseCase
  implements IUseCase<GoogleLoginInput, LoginOutput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: GoogleLoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByGoogleId(input.googleId);
    const refreshTokenHash = await bcrypt.hash(input.refreshToken, 10);

    if (user) {
      const refreshToken = await RefreshTokenFactory.create({
        refreshTokenHash,
        userId: user.userId,
      });
      await this.refreshTokenRepository.insert(refreshToken);

      return {
        userId: user.userId.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        isActive: user.isActive,
      };
    }

    const newUser = UserFactory.create({
      name: input.name,
      email: input.email,
      googleId: input.googleId,
      picture: input.picture,
    });

    await this.userRepository.insert(newUser);

    const refreshToken = new RefreshToken({
      userId: newUser.userId,
      refreshTokenHash,
    });

    await this.refreshTokenRepository.insert(refreshToken);

    return {
      userId: newUser.userId.toString(),
      email: newUser.email,
      name: newUser.name,
      picture: newUser.picture,
      isActive: newUser.isActive,
    };
  }
}

type LoginOutput = {
  userId: string;
  email: string;
  name: string;
  picture: string | null;
  isActive: boolean;
};
