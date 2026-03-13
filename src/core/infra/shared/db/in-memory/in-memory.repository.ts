import { ValueObject } from "@domain/shared/value-objects/value-object";
import { Entity } from "@domain/shared/entity";
import { IRepository } from "@domain/shared/repositories/repository-interface";
import { NotFoundError } from "@domain/shared/errors/not-found.error";

export abstract class InMemoryRepository<E extends Entity>
  implements IRepository<E>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entityId.equals(entity.entityId),
    );

    if (index === -1) {
      throw new NotFoundError(entity.entityId.toString(), this.getEntity());
    }

    this.items[index] = entity;
  }

  async delete(entityId: ValueObject): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entityId.equals(entityId),
    );

    if (index === -1) {
      throw new NotFoundError(entityId.toString(), this.getEntity());
    }

    this.items.splice(index, 1);
  }

  async findById(entityId: ValueObject): Promise<E | null> {
    const item = this.items.find((item) => item.entityId.equals(entityId));

    if (!item) return null;

    return item;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <It has to be any because we need to return the constructor of the entity>
  abstract getEntity(): new (...args: any[]) => E;
}
