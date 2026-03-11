import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { IUseCase } from "../../shared/use-case.interface";
import {
  EndpointOutput,
  EndpointOutputMapper,
} from "../common/endpoint.output";
import { CreateEndpointInput } from "./create-endpoint.input";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

export class CreateEndpointUseCase
  implements IUseCase<CreateEndpointInput, EndpointOutput>
{
  constructor(private readonly repository: IEndpointRepository) {}

  async execute(input: CreateEndpointInput): Promise<EndpointOutput> {
    const statusCode = new StatusCode(input.statusCode);

    const endpoint = EndpointFactory.create({
      ...input,
      statusCode,
    });

    if (endpoint.notification.hasErrors()) {
      throw new EntityValidationError(endpoint.notification.toJSON());
    }

    await this.repository.insert(endpoint);

    return EndpointOutputMapper.toOutput(endpoint);
  }
}
