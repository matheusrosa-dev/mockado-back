import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { IUseCase } from "../../../shared/use-case.interface";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

export class SimulateEndpointUseCase
  implements IUseCase<SimulateEndpointInput, SimulateEndpointOutput>
{
  constructor(private endpointRepository: IEndpointRepository) {}

  async execute(input: SimulateEndpointInput): Promise<SimulateEndpointOutput> {
    const endpoint = await this.endpointRepository.findByIdWithUserId({
      endpointId: new Uuid(input.endpointId),
      userId: new Uuid(input.userId),
    });

    await this.fakeDelay(endpoint?.delay ?? 0);

    if (!endpoint) {
      throw new NotFoundError(input.endpointId, Endpoint);
    }

    if (!endpoint.responseBodyType) {
      return {
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
      };
    }

    if (endpoint.responseBodyType === ResponseBodyType.NULL) {
      return {
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
      };
    }

    if (endpoint.responseBodyType === ResponseBodyType.EMPTY) {
      return {
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
      };
    }

    if (endpoint.responseBodyType === ResponseBodyType.TEXT) {
      return {
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        responseBodyType: endpoint.responseBodyType,
        responseText: endpoint.responseText,
      };
    }

    // if is JSON
    return {
      method: endpoint.method,
      statusCode: endpoint.statusCode.statusCode,
      responseBodyType: endpoint.responseBodyType,
      responseJson: JSON.parse(endpoint.responseJson!),
    };
  }

  private fakeDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

type SimulateEndpointInput = {
  endpointId: string;
  userId: string;
};

type SimulateEndpointOutput = {
  method: HttpMethod;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: object;
  responseText?: string;
};
