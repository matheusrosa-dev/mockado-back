import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { IUseCase } from "../../../shared/use-case.interface";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

// mover isso para common
import { IApiKeyService } from "@app/me/services/api-key.service";

export class MockEndpointUseCase
  implements IUseCase<MockEndpointInput, MockEndpointOutput>
{
  constructor(
    private endpointRepository: IEndpointRepository,
    private apiKeyService: IApiKeyService,
  ) {}

  async execute(input: MockEndpointInput): Promise<MockEndpointOutput> {
    const endpoint = await this.endpointRepository.findByIdWithApiKeyHash({
      endpointId: new Uuid(input.endpointId),
      apiKeyHash: this.apiKeyService.generateFromApiKey(input.apiKey),
    });

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
  apiKey: string;
  endpointId: string;
  method: HttpMethod;
};

type MockEndpointOutput = {
  delay: number;
  statusCode: number;
  response: undefined | null | string | object;
};
