import { IsNotEmpty, IsUUID } from "class-validator";

type ConstructorProps = {
  endpointId: string;
};

export class FindEndpointInput {
  @IsNotEmpty()
  @IsUUID()
  endpointId: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
