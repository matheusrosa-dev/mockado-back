import { DataSource, Repository } from "typeorm";
import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { EndpointModel } from "./endpoint-typeorm.model";
import { EndpointModelMapper } from "./endpoint-model-mapper";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

export class EndpointTypeOrmRepository implements IEndpointRepository {
  private repository: Repository<EndpointModel>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(EndpointModel);
  }

  async insert(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async update(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);
    const { affected } = await this.repository.update(model.endpointId, model);

    if (!affected) {
      throw new NotFoundError(entity.endpointId.toString(), this.getEntity());
    }
  }

  async delete(endpointId: Uuid): Promise<void> {
    const { affected } = await this.repository.delete(endpointId.toString());

    if (!affected) {
      throw new NotFoundError(endpointId.toString(), this.getEntity());
    }
  }

  async findById(endpointId: Uuid): Promise<Endpoint | null> {
    const model = await this.repository.findOneBy({
      endpointId: endpointId.toString(),
    });

    if (!model) {
      return null;
    }

    return EndpointModelMapper.toEntity(model);
  }

  async findAll(): Promise<Endpoint[]> {
    const models = await this.repository.find({
      order: { createdAt: "ASC" },
    });

    return models.map((model) => EndpointModelMapper.toEntity(model));
  }

  async findAllSummary() {
    const models = await this.repository.find({
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

  getEntity() {
    return Endpoint;
  }
}
