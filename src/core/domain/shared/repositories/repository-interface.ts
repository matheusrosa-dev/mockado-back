import { Entity } from "../entity";
import { ValueObject } from "../value-objects/value-object";

export interface IRepository<E extends Entity> {
  insert(entity: E): Promise<void>;
  update(entity: E): Promise<void>;
  delete(entityId: ValueObject): Promise<void>;

  findById(entityId: ValueObject): Promise<E | null>;
  findAll(): Promise<E[]>;
}
