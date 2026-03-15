import { IUseCase } from "../../../shared/use-case.interface";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { HttpMethod } from "@domain/endpoint/endpoint.types";
import { ListEndpointsSummaryInput } from "./list-endpoints-summary.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

type Output = {
  id: string;
  title: string;
  method: HttpMethod;
}[];

export class ListEndpointsSummaryUseCase
  implements IUseCase<ListEndpointsSummaryInput, Output>
{
  constructor(private endpointRepository: IEndpointRepository) {}

  async execute(input: ListEndpointsSummaryInput): Promise<Output> {
    const endpoints = await this.endpointRepository.findSummaryByUserId({
      ...(input.userId && { userId: new Uuid(input.userId) }),
      ...(input.googleId && { googleId: input.googleId }),
    });

    return endpoints.map((endpoint) => ({
      id: endpoint.endpointId.toString(),
      title: endpoint.title,
      method: endpoint.method,
    }));
  }
}
