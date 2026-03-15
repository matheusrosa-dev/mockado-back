import { CreateEndpointInput } from "@app/endpoint/use-cases/create-endpoint/create-endpoint.input";
import { IsOptional } from "class-validator";

export class CreateEndpointDto extends CreateEndpointInput {
  @IsOptional()
  declare googleId?: string;

  @IsOptional()
  declare userId?: string;
}
