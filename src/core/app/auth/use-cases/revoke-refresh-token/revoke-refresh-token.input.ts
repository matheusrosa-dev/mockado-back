import { IsNotEmpty, IsUUID } from "class-validator";

type ConstructorProps = {
  refreshTokenId: string;
};

export class RevokeRefreshTokenInput {
  @IsNotEmpty()
  @IsUUID()
  refreshTokenId: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
