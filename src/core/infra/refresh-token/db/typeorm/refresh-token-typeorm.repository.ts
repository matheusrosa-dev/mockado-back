import { DataSource, Repository } from "typeorm";
import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";
import { IRefreshTokenRepository } from "@domain/refresh-token/refresh-token.repository";
import { RefreshTokenModel } from "./refresh-token-typeorm.model";
import { RefreshTokenModelMapper } from "./refresh-token-model-mapper";

export class RefreshTokenTypeOrmRepository implements IRefreshTokenRepository {
  private repository: Repository<RefreshTokenModel>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(RefreshTokenModel);
  }

  async insert(entity: RefreshToken): Promise<void> {
    const model = RefreshTokenModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async update(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async findById(): Promise<RefreshToken | null> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<RefreshToken[]> {
    throw new Error("Method not implemented.");
  }

  getEntity() {
    return RefreshToken;
  }
}
