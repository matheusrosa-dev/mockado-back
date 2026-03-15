import { FindEndpointInput } from "@app/endpoint/use-cases/find-endpoint/find-endpoint.input";
import { IsOptional } from "class-validator";

export class FindEndpointByIdDto extends FindEndpointInput {
  @IsOptional()
  declare googleId?: string;

  @IsOptional()
  declare userId?: string;
}
