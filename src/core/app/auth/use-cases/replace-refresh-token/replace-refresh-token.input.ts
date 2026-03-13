import { IsNotEmpty, IsString, IsUUID } from "class-validator";

type ConstructorProps = {
  googleId: string;
  userId: string;
  newRefreshToken: string;
  refreshTokenIdToRemove: string;
};

export class ReplaceRefreshTokenInput {
  @IsNotEmpty()
  @IsUUID()
  refreshTokenIdToRemove: string;

  @IsNotEmpty()
  @IsString()
  newRefreshToken: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  googleId: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
