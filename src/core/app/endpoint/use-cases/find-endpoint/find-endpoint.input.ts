import { IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";

type ConstructorProps = {
  endpointId: string;
  userId?: string;
  googleId?: string;
};

export class FindEndpointInput {
  @IsNotEmpty()
  @IsUUID()
  endpointId: string;

  @ValidateIf((object) => !object.googleId)
  @IsNotEmpty()
  @IsUUID()
  userId?: string;

  @ValidateIf((object) => !object.userId)
  @IsNotEmpty()
  @IsString()
  googleId?: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
