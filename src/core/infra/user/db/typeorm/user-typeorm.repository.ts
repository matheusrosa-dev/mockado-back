import { DataSource, Repository } from "typeorm";
import { User } from "@domain/user/user.entity";
import { IUserRepository } from "@domain/user/user.repository";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { UserModel } from "./user-typeorm.model";
import { UserModelMapper } from "./user-model-mapper";

export class UserTypeOrmRepository implements IUserRepository {
  private repository: Repository<UserModel>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserModel);
  }

  async insert(entity: User): Promise<void> {
    const model = UserModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async update(entity: User): Promise<void> {
    const model = UserModelMapper.toModel(entity);
    const { affected } = await this.repository.update(model.userId, model);

    if (!affected) {
      throw new NotFoundError(entity.userId, this.getEntity());
    }
  }

  async delete(userId: Uuid): Promise<void> {
    const { affected } = await this.repository.delete(userId.toString());

    if (!affected) {
      throw new NotFoundError(userId, this.getEntity());
    }
  }

  async findById(): Promise<User | null> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<User[]> {
    throw new Error("Method not implemented.");
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const model = await this.repository.findOneBy({ googleId });

    if (!model) {
      return null;
    }

    return UserModelMapper.toEntity(model);
  }

  getEntity() {
    return User;
  }
}
