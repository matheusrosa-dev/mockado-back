import { DataSource, Repository } from "typeorm";
import { Endpoint } from "../../../../domain/endpoint/endpoint.entity";
import { IEndpointRepository } from "../../../../domain/endpoint/endpoint.repository";
import { EndpointModel } from "./endpoint-typeorm.model";
import { EndpointModelMapper } from "./endpoint-model-mapper";
import { Uuid } from "../../../../domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "../../../../domain/shared/errors/not-found.error";

type ConstructorProps = {
  dataSource: DataSource;
  endpointModel: typeof EndpointModel;
};

export class EndpointTypeOrmRepository implements IEndpointRepository {
  private repository: Repository<EndpointModel>;

  constructor(props: ConstructorProps) {
    this.repository = props.dataSource.getRepository(props.endpointModel);
  }

  async insert(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);

    await this.repository.save(model);
  }

  async update(entity: Endpoint): Promise<void> {
    const model = EndpointModelMapper.toModel(entity);
    const { affected } = await this.repository.update(model.endpoint_id, model);

    if (!affected) {
      throw new NotFoundError(entity.entity_id, this.getEntity());
    }
  }

  async delete(entity_id: Uuid): Promise<void> {
    const { affected } = await this.repository.delete(entity_id.id);

    if (!affected) {
      throw new NotFoundError(entity_id, this.getEntity());
    }
  }

  async findById(entity_id: Uuid): Promise<Endpoint | null> {
    const model = await this.repository.findOneBy({
      endpoint_id: entity_id.id,
    });

    if (!model) {
      return null;
    }

    return EndpointModelMapper.toEntity(model);
  }

  async findAll(): Promise<Endpoint[]> {
    const models = await this.repository.find();

    return models.map((model) => EndpointModelMapper.toEntity(model));
  }

  getEntity() {
    return Endpoint;
  }
}
