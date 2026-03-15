import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { Either } from "@domain/shared/either";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import bcrypt from "bcrypt";

export class RefreshTokenExistsValidator {
  constructor(private refreshTokenRepository: IRefreshTokenRepository) {}

  // TODO: ADICIONAR VALIDATORS NOS OUTROS USE CASES
  async validate(props: {
    googleId: string;
    refreshToken: string;
  }): Promise<Either<RefreshToken, NotFoundError>> {
    const refreshTokens = await this.refreshTokenRepository.findManyByAnyId({
      googleId: props.googleId,
    });

    for (const refreshToken of refreshTokens) {
      const isMatch = await bcrypt.compare(
        props.refreshToken,
        refreshToken.refreshTokenHash,
      );

      if (!isMatch) continue;

      return Either.ok(refreshToken);
    }

    return Either.fail(new NotFoundError(props.googleId, RefreshToken));
  }
}
