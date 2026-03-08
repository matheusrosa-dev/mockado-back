import { EntityValidationError } from "../../../domain/shared/validators/validation.error";
import { Endpoint } from "../../../domain/endpoint/endpoint.entity";
import { IUseCase } from "../../shared/use-case.interface";
import {
  EndpointOutput,
  EndpointOutputMapper,
} from "../common/endpoint-output";
import { UpdateEndpointInput } from "./update-endpoint.input";
import { IEndpointRepository } from "../../../domain/endpoint/endpoint.repository";
import { Uuid } from "../../../domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "../../../domain/shared/errors/not-found.error";

export class UpdateEndpointUseCase
  implements IUseCase<UpdateEndpointInput, EndpointOutput>
{
  constructor(private readonly repository: IEndpointRepository) {}

  async execute(input: UpdateEndpointInput): Promise<EndpointOutput> {
    const endpointId = new Uuid(input.id);

    const endpoint = await this.repository.findById(endpointId);

    if (!endpoint) {
      throw new NotFoundError(endpointId, Endpoint);
    }

    if (input.title) {
      endpoint.changeTitle(input.title);
    }

    if (input.method) {
      endpoint.changeMethod(input.method);
    }

    if (input.description !== undefined) {
      endpoint.changeDescription(input.description);
    }

    if (input.delay !== undefined) {
      endpoint.changeDelay(input.delay);
    }

    if (input.statusCode) {
      endpoint.changeStatusCode(input.statusCode);
    }

    if (input.responseBodyType) {
      endpoint.changeResponseBodyType(input.responseBodyType);
    }

    if (input.responseJson !== undefined) {
      endpoint.changeResponseJson(input.responseJson);
    }

    if (input.responseText !== undefined) {
      endpoint.changeResponseText(input.responseText);
    }

    if (endpoint.notification.hasErrors()) {
      throw new EntityValidationError(endpoint.notification.toJSON());
    }

    await this.repository.update(endpoint);

    return EndpointOutputMapper.toOutput(endpoint);
  }
}
