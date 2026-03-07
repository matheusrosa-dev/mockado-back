import { IsNotEmpty, IsUUID } from "class-validator";

type ConstructorProps = {
  id: string;
};

export class DeleteEndpointInput {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  constructor(props: ConstructorProps) {
    if (!props) return;

    Object.assign(this, props);
  }
}
