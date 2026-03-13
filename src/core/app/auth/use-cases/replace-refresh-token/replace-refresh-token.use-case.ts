import { IUseCase } from "@app/shared/use-case.interface";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { ReplaceRefreshTokenInput } from "./replace-refresh-token.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import bcrypt from "bcrypt";

export class ReplaceRefreshTokenUseCase
  implements IUseCase<ReplaceRefreshTokenInput, ReplaceRefreshTokenOutput>
{
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    input: ReplaceRefreshTokenInput,
  ): Promise<ReplaceRefreshTokenOutput> {
    const refreshTokenIdToRemove = new Uuid(input.refreshTokenIdToRemove);

    await this.refreshTokenRepository.delete(refreshTokenIdToRemove);

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
