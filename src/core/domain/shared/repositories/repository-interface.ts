import { Entity } from "../entity";
import { ValueObject } from "../value-objects/value-object";

export interface IRepository<E extends Entity, EntityId extends ValueObject> {
  insert(entity: E): Promise<void>;
  update(entity: E): Promise<void>;
  delete(entity_id: EntityId): Promise<void>;

  findById(entity_id: EntityId): Promise<E | null>;
  findAll(): Promise<E[]>;

  // biome-ignore lint/suspicious/noExplicitAny: <It has to be any because we need to return the constructor of the entity>
  getEntity(): new (...args: any[]) => E;
}
