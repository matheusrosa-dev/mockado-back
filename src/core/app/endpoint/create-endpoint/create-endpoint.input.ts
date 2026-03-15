import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";

type ConstructorProps = {
  title: string;
  userId?: string;
  googleId?: string;
  method: HttpMethod;
  description?: string;
  delay?: number;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
};

export class CreateEndpointInput {
  @IsNotEmpty()
  @IsString()
  title: string;

  @ValidateIf((object) => !object.googleId)
  @IsNotEmpty()
  @IsUUID()
  userId?: string;

  @ValidateIf((object) => !object.userId)
  @IsNotEmpty()
  @IsString()
  googleId?: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  delay?: number;

  @IsInt()
  @Min(100)
  @Max(511)
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
    if (!props) return;

    Object.assign(this, props);
  }
}
