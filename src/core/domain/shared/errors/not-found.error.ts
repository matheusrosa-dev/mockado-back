import { Entity } from "../entity";

export class NotFoundError extends Error {
  constructor(
    id: string | string[],
    // biome-ignore lint/suspicious/noExplicitAny: <It has to be any because we need to receive the constructor of the entity>
    entityClass: new (...args: any[]) => Entity,
  ) {
    if (Array.isArray(id)) {
      super(
        `${entityClass.name} Not Found using IDs: ${id.map((id) => id).join(", ")}`,
      );
    } else {
      super(`${entityClass.name} Not Found using ID: ${id}`);
    }

    this.name = "NotFoundError";
  }
}
