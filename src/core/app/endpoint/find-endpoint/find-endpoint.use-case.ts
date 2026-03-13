import { IUseCase } from "../../shared/use-case.interface";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { FindEndpointInput } from "./find-endpoint.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import {
  EndpointOutput,
  EndpointOutputMapper,
} from "../common/endpoint.output";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Endpoint } from "@domain/endpoint/endpoint.entity";

export class FindEndpointUseCase
  implements IUseCase<FindEndpointInput, EndpointOutput>
{
  constructor(private readonly repository: IEndpointRepository) {}

  async execute(input: FindEndpointInput): Promise<EndpointOutput> {
    const endpointId = new Uuid(input.endpointId);

    const endpoint = await this.repository.findById(endpointId);

    if (!endpoint) {
      throw new NotFoundError(endpointId.toString(), Endpoint);
    }

    return EndpointOutputMapper.toOutput(endpoint);
  }
}
