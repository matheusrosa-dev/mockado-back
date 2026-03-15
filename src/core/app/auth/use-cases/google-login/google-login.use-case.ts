import { IUseCase } from "@app/shared/use-case.interface";
import { GoogleLoginInput } from "./google-login.input";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { UserFactory } from "@domain/user/user.entity";
import bcrypt from "bcrypt";
import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { IGoogleLoginUnitOfWork } from "./google-login.unit-of-work";

export class GoogleLoginUseCase
  implements IUseCase<GoogleLoginInput, LoginOutput>
{
  constructor(private unitOfWork: IGoogleLoginUnitOfWork) {}

  async execute(input: GoogleLoginInput): Promise<LoginOutput> {
    return this.unitOfWork.runInTransaction(async (repositories) => {
      const { userRepository, refreshTokenRepository } = repositories;
      let user = await userRepository.findByGoogleId(input.googleId);

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

        await userRepository.update(user);
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

        await userRepository.insert(user);
      }

      const refreshTokenHash = await bcrypt.hash(input.refreshToken, 10);

      const refreshToken = RefreshTokenFactory.create({
        refreshTokenHash,
        userId: user.userId,
        googleId: input.googleId,
      });

      if (refreshToken.notification.hasErrors()) {
        throw new EntityValidationError(refreshToken.notification.toJSON());
      }

      await refreshTokenRepository.insert(refreshToken);

      return {
        userId: user.userId.toString(),
        email: user.email,
        name: user.name,
        googleId: user.googleId,
      };
    });
  }
}

type LoginOutput = {
  userId: string;
  email: string;
  name: string;
  googleId: string;
};
