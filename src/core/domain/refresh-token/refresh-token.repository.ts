import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { IRepository } from "../shared/repositories/repository-interface";
import { RefreshToken } from "./refresh-token.entity";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";

type RefreshTokenModelWithoutRelationsUser = Omit<
  InstanceType<typeof RefreshTokenModel>,
  "user"
>;

export type FindManyByUserIdResponse = RefreshTokenModelWithoutRelationsUser & {
  user: Pick<
    InstanceType<typeof RefreshTokenModel>["user"],
    "userId" | "name" | "email" | "isActive" | "apiKeyHash"
  >;
};

export interface IRefreshTokenRepository extends IRepository<RefreshToken> {
  findManyByUserId(userId: Uuid): Promise<FindManyByUserIdResponse[]>;
}
