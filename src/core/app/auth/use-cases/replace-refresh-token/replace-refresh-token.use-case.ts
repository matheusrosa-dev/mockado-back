import { IUseCase } from "@app/shared/use-case.interface";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { ReplaceRefreshTokenInput } from "./replace-refresh-token.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import bcrypt from "bcrypt";

export class ReplaceRefreshTokenUseCase
  implements IUseCase<ReplaceRefreshTokenInput, ReplaceRefreshTokenOutput>
{
  constructor(private refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(
    input: ReplaceRefreshTokenInput,
  ): Promise<ReplaceRefreshTokenOutput> {
    const refreshTokenIdToRevoke = new Uuid(input.refreshTokenIdToRevoke);

    await this.refreshTokenRepository.delete(refreshTokenIdToRevoke);

    const refreshTokenHash = await bcrypt.hash(input.newRefreshToken, 10);

    const newRefreshToken = RefreshTokenFactory.create({
      userId: new Uuid(input.userId),
      googleId: input.googleId,
      refreshTokenHash,
    });

    await this.refreshTokenRepository.insert(newRefreshToken);
  }
}

type ReplaceRefreshTokenOutput = void;
