import { IsNotEmpty, IsUUID } from "class-validator";

export class MockEndpointDto {
  @IsNotEmpty()
  @IsUUID()
  endpointId: string;

  constructor(props: MockEndpointDto) {
    if (!props) return;

    Object.assign(this, props);
  }
}
