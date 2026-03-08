import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";

type ConstructorProps = {
  id: string;
  title?: string;
  method?: HttpMethod;
  description?: string;
  delay?: number;
  statusCode?: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
};

export class UpdateEndpointInput {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(HttpMethod)
  method?: HttpMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  delay?: number;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsEnum(ResponseBodyType)
  responseBodyType?: ResponseBodyType;

  @IsOptional()
  @IsJSON()
  responseJson?: string;

  @IsOptional()
  @IsString()
  responseText?: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
