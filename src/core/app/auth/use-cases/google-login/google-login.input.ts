import { IsEmail, IsNotEmpty, IsString } from "class-validator";

type ConstructorProps = {
  googleId: string;
  email: string;
  name: string;
  refreshToken: string;
};

export class GoogleLoginInput {
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
