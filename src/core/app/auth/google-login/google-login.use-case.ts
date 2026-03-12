import { IUseCase } from "@app/shared/use-case.interface";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { IUserRepository } from "@domain/user/user.repository";
import { GoogleLoginInput } from "./google-login.input";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { UserFactory } from "@domain/user/user.entity";
import bcrypt from "bcrypt";
import { EntityValidationError } from "@domain/shared/validators/validation.error";

export class GoogleLoginUseCase
  implements IUseCase<GoogleLoginInput, LoginOutput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: GoogleLoginInput): Promise<LoginOutput> {
    let user = await this.userRepository.findByGoogleId(input.googleId);

    if (user) {
      if (user.name !== input.name) {
        user.changeName(input.name);
      }

      if (input.email !== user.email) {
        user.changeEmail(input.email);
      }

      if (user.notification.hasErrors()) {
        throw new EntityValidationError(user.notification.toJSON());
      }

      await this.userRepository.update(user);
    }

    if (!user) {
      user = UserFactory.create({
        name: input.name,
        email: input.email,
        googleId: input.googleId,
      });

      if (user.notification.hasErrors()) {
        throw new EntityValidationError(user.notification.toJSON());
      }

      await this.userRepository.insert(user);
    }

    const refreshTokenHash = await bcrypt.hash(input.refreshToken, 10);

    const refreshToken = RefreshTokenFactory.create({
      refreshTokenHash,
      userId: user.userId,
    });

    if (refreshToken.notification.hasErrors()) {
      throw new EntityValidationError(refreshToken.notification.toJSON());
    }

    await this.refreshTokenRepository.insert(refreshToken);

    return {
      userId: user.userId.toString(),
      email: user.email,
      name: user.name,
      googleId: user.googleId,
    };
  }
}

type LoginOutput = {
  userId: string;
  email: string;
  name: string;
  googleId: string;
};
