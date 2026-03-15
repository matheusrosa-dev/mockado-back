import { FindEndpointInput } from "@app/endpoint/find-endpoint/find-endpoint.input";
import { IsOptional } from "class-validator";

export class FindEndpointByIdDto extends FindEndpointInput {
  @IsOptional()
  declare googleId?: string;

  @IsOptional()
  declare userId?: string;
}
