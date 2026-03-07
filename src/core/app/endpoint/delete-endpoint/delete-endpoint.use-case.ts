import { IUseCase } from "../../shared/use-case.interface";
import { IEndpointRepository } from "../../../domain/endpoint/endpoint.repository";
import { DeleteEndpointInput } from "./delete-endpoint.input";
import { Uuid } from "../../../domain/shared/value-objects/uuid.vo";

export class DeleteEndpointUseCase
  implements IUseCase<DeleteEndpointInput, void>
{
  constructor(private readonly repository: IEndpointRepository) {}

  async execute(input: DeleteEndpointInput): Promise<void> {
    const endpointId = new Uuid(input.id);

    await this.repository.delete(endpointId);
  }
}
