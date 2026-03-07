import { Uuid } from "../../../../domain/shared/value-objects/uuid.vo";
import { Endpoint } from "../../../../domain/endpoint/endpoint.entity";
import { InMemoryRepository } from "../../../../infra/shared/db/in-memory/in-memory.repository";
import { IEndpointRepository } from "../../../../domain/endpoint/endpoint.repository";

export class EndpointInMemoryRepository
  extends InMemoryRepository<Endpoint, Uuid>
  implements IEndpointRepository
{
  getEntity(): new (...args: any[]) => Endpoint {
    return Endpoint;
  }
}
