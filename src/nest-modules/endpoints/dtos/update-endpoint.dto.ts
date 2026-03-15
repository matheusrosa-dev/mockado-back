import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { UpdateEndpointInput } from "@app/endpoint/use-cases/update-endpoint/update-endpoint.input";

export class UpdateEndpointBodyDto extends UpdateEndpointInput {
  @IsOptional()
  declare id: string;

  @IsOptional()
  declare googleId?: string;

  @IsOptional()
  declare userId?: string;
}

export class UpdateEndpointParamsDto {
  @IsNotEmpty()
  @IsUUID()
  endpointId: string;
}
