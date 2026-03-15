import { DataSource, EntityManager, Repository } from "typeorm";
import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
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

  async findManyByAnyId(props: {
    googleId?: string;
    userId?: Uuid;
  }): Promise<RefreshToken[]> {
    const models = await this.repository.find({
      where: {
        userId: props.userId?.toString(),
        googleId: props?.googleId,
      },
    });

    return models.map((model) => RefreshTokenModelMapper.toEntity(model));
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
