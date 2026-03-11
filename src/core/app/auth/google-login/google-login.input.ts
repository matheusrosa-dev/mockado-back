import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

type ConstructorProps = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
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

  @IsOptional()
  @IsString()
  picture?: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
