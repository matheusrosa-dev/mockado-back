import { InMemoryRepository } from "../../../shared/db/in-memory/in-memory.repository";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";

export class RefreshTokenInMemoryRepository
  extends InMemoryRepository<RefreshToken>
  implements IRefreshTokenRepository
{
  getEntity() {
    return RefreshToken;
  }
}
