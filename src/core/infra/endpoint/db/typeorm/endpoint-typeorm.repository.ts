import { DataSource, EntityManager, Repository } from "typeorm";
import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { EndpointModel } from "./endpoint-typeorm.model";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { EndpointModelMapper } from "./endpoint-model-mapper";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

export class EndpointTypeOrmRepository implements IEndpointRepository {
  private repository: Repository<EndpointModel>;

  constructor(dataSource: DataSource | EntityManager) {
    this.repository = dataSource.getRepository(EndpointModel);
  }

  async insert(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async update(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);

    const result = await this.repository.update(
      { endpointId: model.endpointId },
      model,
    );

    if (!result?.affected) {
      throw new NotFoundError(model.endpointId, Endpoint);
    }
  }

  async findByIdWithUserId(props: { endpointId: Uuid; userId: Uuid }) {
    const model = await this.repository.findOne({
      where: {
        endpointId: props.endpointId.toString(),
        userId: props.userId.toString(),
      },
    });

    if (!model) {
      return null;
    }

    return EndpointModelMapper.toEntity(model);
  }

  async findById(endpointId: Uuid) {
    const model = await this.repository.findOne({
      where: {
        endpointId: endpointId.toString(),
      },
    });

    if (!model) {
      return null;
    }

    return EndpointModelMapper.toEntity(model);
  }

  async findSummaryByUserId(userId: Uuid) {
    const models = await this.repository.find({
      where: {
        userId: userId.toString(),
      },
      order: { createdAt: "ASC" },
      select: {
        endpointId: true,
        title: true,
        method: true,
      },
    });

    return models.map((model) => ({
      endpointId: new Uuid(model.endpointId),
      title: model.title,
      method: model.method,
    }));
  }

  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  findAll(): Promise<Endpoint[]> {
    throw new Error("Method not implemented.");
  }
}
