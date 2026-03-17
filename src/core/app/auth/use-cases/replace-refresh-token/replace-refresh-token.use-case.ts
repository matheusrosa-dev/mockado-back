import { IUseCase } from "@app/shared/use-case.interface";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { RefreshTokenExistsValidator } from "@app/auth/validations/refresh-token-exists/refresh-token-exists.validator";
import { IHashService } from "@app/auth/services/hash.service";
import { AuthenticationError } from "@domain/shared/errors/authentication.error";
import { IAuthTokenService } from "@app/auth/services/auth-token.service";
import { IReplaceRefreshTokenUnitOfWork } from "./replace-refresh-token.unit-of-work";

export class ReplaceRefreshTokenUseCase
  implements IUseCase<ReplaceRefreshTokenInput, ReplaceRefreshTokenOutput>
{
  constructor(
    private unitOfWork: IReplaceRefreshTokenUnitOfWork,
    private hashService: IHashService,
    private authTokenService: IAuthTokenService,
  ) {}

  async execute(
    input: ReplaceRefreshTokenInput,
  ): Promise<ReplaceRefreshTokenOutput> {
    return this.unitOfWork.runInTransaction(async (repositories) => {
      const { refreshTokenRepository } = repositories;

      const refreshTokenExistsValidator = new RefreshTokenExistsValidator(
        refreshTokenRepository,
        this.hashService,
      );

      const [refreshTokenExists, notFoundError] = (
        await refreshTokenExistsValidator.validate({
          userId: new Uuid(input.userId),
          refreshToken: input.refreshToken,
        })
      ).asArray();

      if (notFoundError) {
        throw new AuthenticationError("Refresh token not found for the user");
      }

      if (!refreshTokenExists.user.isActive) {
        throw new AuthenticationError("User account is inactive");
      }

      const newTokens = await this.authTokenService.generate({
        userId: refreshTokenExists.user.userId,
        email: refreshTokenExists.user.email,
        name: refreshTokenExists.user.name,
      });

      const refreshTokenHash = await this.hashService.hash(
        newTokens.refreshToken,
      );

      await refreshTokenRepository.delete(
        new Uuid(refreshTokenExists.refreshTokenId),
      );

      const refreshToken = RefreshTokenFactory.create({
        userId: new Uuid(refreshTokenExists.userId),
        refreshTokenHash,
      });

      await refreshTokenRepository.insert(refreshToken);

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        user: {
          id: refreshTokenExists.user.userId,
          email: refreshTokenExists.user.email,
          name: refreshTokenExists.user.name,
          hasApiKey: !!refreshTokenExists.user.apiKeyHash,
        },
      };
    });
  }
}

type ReplaceRefreshTokenInput = {
  userId: string;
  refreshToken: string;
};

type ReplaceRefreshTokenOutput = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    hasApiKey: boolean;
  };
};
