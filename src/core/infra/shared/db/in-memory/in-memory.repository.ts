import { ValueObject } from "../../../../domain/shared/value-objects/value-object";
import { Entity } from "../../../../domain/shared/entity";
import { IRepository } from "../../../../domain/shared/repositories/repository-interface";
import { NotFoundError } from "../../../../domain/shared/errors/not-found.error";

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject,
> implements IRepository<E, EntityId>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );

    if (index === -1) {
      throw new NotFoundError(entity.entity_id, this.getEntity());
    }

    this.items[index] = entity;
  }

  async delete(entity_id: EntityId): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity_id),
    );

    if (index === -1) {
      throw new NotFoundError(entity_id, this.getEntity());
    }

    this.items.splice(index, 1);
  }

  async findById(entity_id: EntityId): Promise<E | null> {
    const item = this.items.find((item) => item.entity_id.equals(entity_id));

    if (!item) return null;

    return item;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <It has to be any because we need to return the constructor of the entity>
  abstract getEntity(): new (...args: any[]) => E;
}
