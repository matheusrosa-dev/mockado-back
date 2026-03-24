import { IRepository } from "../shared/repositories/repository-interface";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { Endpoint } from "./endpoint.entity";
import { HttpMethod } from "./endpoint.types";

export interface IEndpointRepository extends IRepository<Endpoint> {
  findByIdWithUserId(props: {
    endpointId: Uuid;
    userId: Uuid;
  }): Promise<Endpoint | null>;

  findById(endpointId: Uuid): Promise<Endpoint | null>;

  findSummaryByUserId(userId: Uuid): Promise<
    Array<{
      endpointId: Uuid;
      title: string;
      method: HttpMethod;
    }>
  >;
}
