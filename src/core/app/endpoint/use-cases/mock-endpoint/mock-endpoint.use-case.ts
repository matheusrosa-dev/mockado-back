import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { IUseCase } from "../../../shared/use-case.interface";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

export class MockEndpointUseCase
  implements IUseCase<MockEndpointInput, MockEndpointOutput>
{
  constructor(private endpointRepository: IEndpointRepository) {}

  async execute(input: MockEndpointInput): Promise<MockEndpointOutput> {
    const endpoint = await this.endpointRepository.findById(
      new Uuid(input.endpointId),
    );

    if (!endpoint) {
      throw new NotFoundError(input.endpointId, Endpoint);
    }

    if (endpoint.method !== input.method) {
      throw new NotFoundError(input.endpointId, Endpoint);
    }

    if (
      !endpoint.responseBodyType ||
      endpoint.responseBodyType === ResponseBodyType.EMPTY
    ) {
      return {
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: undefined,
      };
    }

    if (endpoint.responseBodyType === ResponseBodyType.NULL) {
      return {
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: null,
      };
    }

    if (endpoint.responseBodyType === ResponseBodyType.TEXT) {
      return {
        delay: endpoint.delay,
        statusCode: endpoint.statusCode.statusCode,
        response: endpoint.responseText,
      };
    }

    // if is JSON
    return {
      delay: endpoint.delay,
      statusCode: endpoint.statusCode.statusCode,
      response: JSON.parse(endpoint.responseJson!),
    };
  }
}

type MockEndpointInput = {
  endpointId: string;
  method: HttpMethod;
};

type MockEndpointOutput = {
  delay: number;
  statusCode: number;
  response: undefined | null | string | object;
};
