import { IUseCase } from "@app/shared/use-case.interface";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RevokeRefreshTokenInput } from "./revoke-refresh-token.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

export class RevokeRefreshTokenUseCase
  implements IUseCase<RevokeRefreshTokenInput, RevokeRefreshTokenOutput>
{
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    input: RevokeRefreshTokenInput,
  ): Promise<RevokeRefreshTokenOutput> {
    await this.refreshTokenRepository.delete(new Uuid(input.refreshTokenId));
  }
}

type RevokeRefreshTokenOutput = void;
