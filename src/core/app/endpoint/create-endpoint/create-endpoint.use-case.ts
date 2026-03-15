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
import { IUserRepository } from "@domain/user/user.repository";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

export class CreateEndpointUseCase
  implements IUseCase<CreateEndpointInput, EndpointOutput>
{
  constructor(
    private endpointRepository: IEndpointRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(input: CreateEndpointInput): Promise<EndpointOutput> {
    let userId = new Uuid(input.userId);

    if (!input.userId && input.googleId) {
      const existingUser = await this.userRepository.findByGoogleId(
        input.googleId,
      );

      if (!existingUser) {
        throw new Error("User not found with the provided googleId");
      }

      userId = existingUser.userId;
    }

    const statusCode = new StatusCode(input.statusCode);

    const endpoint = EndpointFactory.create({
      ...input,
      userId,
      statusCode,
    });

    if (endpoint.notification.hasErrors()) {
      throw new EntityValidationError(endpoint.notification.toJSON());
    }

    await this.endpointRepository.insert(endpoint);

    return EndpointOutputMapper.toOutput(endpoint);
  }
}
