import { Entity } from "../entity";
import { ValueObject } from "../value-objects/value-object";

export class NotFoundError extends Error {
  constructor(
    entity_id: ValueObject | ValueObject[],
    // biome-ignore lint/suspicious/noExplicitAny: <It has to be any because we need to receive the constructor of the entity>
    entityClass: new (...args: any[]) => Entity,
  ) {
    const idsMessage = Array.isArray(entity_id)
      ? entity_id.join(", ")
      : entity_id;

    super(`${entityClass.name} Not Found using IDs: ${idsMessage}`);

    this.name = "NotFoundError";
  }
}
