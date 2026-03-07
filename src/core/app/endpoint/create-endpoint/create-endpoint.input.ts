import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../domain/endpoint/endpoint.types";

type ConstructorProps = {
  title: string;
  method: HttpMethod;
  description?: string;
  delay?: number;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
};

export class CreateEndpointInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  delay?: number;

  @IsInt()
  statusCode: number;

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
    Object.assign(this, props);
  }
}
