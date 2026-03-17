import { DataSource, EntityManager, Repository } from "typeorm";
import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";
import {
  FindManyByUserIdResponse,
  IRefreshTokenRepository,
} from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenModel } from "./refresh-token-typeorm.model";
import { RefreshTokenModelMapper } from "./refresh-token-model-mapper";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

export class RefreshTokenTypeOrmRepository implements IRefreshTokenRepository {
  private repository: Repository<RefreshTokenModel>;

  constructor(dataSourceOrManager: DataSource | EntityManager) {
    this.repository = dataSourceOrManager.getRepository(RefreshTokenModel);
  }

  async insert(entity: RefreshToken): Promise<void> {
    const model = RefreshTokenModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async findManyByUserId(userId?: Uuid): Promise<FindManyByUserIdResponse[]> {
    const models = await this.repository.find({
      where: {
        userId: userId?.toString(),
      },
      relations: {
        user: true,
      },
      select: {
        user: {
          userId: true,
          name: true,
          email: true,
          isActive: true,
          apiKeyHash: true,
        },
      },
    });

    return models;
  }

  async delete(refreshTokenId: Uuid): Promise<void> {
    const { affected } = await this.repository.delete(
      refreshTokenId.toString(),
    );

    if (!affected) {
      throw new NotFoundError(refreshTokenId.toString(), RefreshToken);
    }
  }

  async update(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async findById(): Promise<RefreshToken | null> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<RefreshToken[]> {
    throw new Error("Method not implemented.");
  }
}
