import { Endpoint } from "@domain/endpoint/endpoint.entity";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";

export type EndpointOutput = {
  id: string;
  userId: string;
  method: HttpMethod;
  title: string;
  description: string;
  delay: number;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
  createdAt: Date;
};

export class EndpointOutputMapper {
  static toOutput(entity: Endpoint): EndpointOutput {
    const { endpointId, ...rest } = entity.toJSON();

    return {
      id: endpointId,
      ...rest,
    };
  }
}
