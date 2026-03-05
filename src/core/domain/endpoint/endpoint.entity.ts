import { Entity } from "../shared/entity";
import { Uuid } from "../shared/value-objects/uuid.vo";

type ConstructorProps = {
  endpoint_id?: Uuid;
  title: string;
  created_at?: Date;
};

export class Endpoint extends Entity {
  endpoint_id: Uuid;
  title: string;
  created_at: Date;

  constructor(props: ConstructorProps) {
    super();
    this.endpoint_id = props.endpoint_id ?? new Uuid();
    this.title = props.title;
    this.created_at = props.created_at ?? new Date();
  }

  get entity_id() {
    return this.endpoint_id;
  }

  toJSON() {
    return {
      endpoint_id: this.endpoint_id.toString(),
      title: this.title,
      created_at: this.created_at,
    };
  }
}
