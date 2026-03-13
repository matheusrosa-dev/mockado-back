import { Entity } from "../../entity";
import { Uuid } from "../../value-objects/uuid.vo";
import { NotFoundError } from "../not-found.error";

class StubEntity extends Entity {
  entityId = new Uuid();

  toJSON(): object {
    return { id: this.entityId.toString() };
  }
}

describe("Not Found Error - Unit Tests", () => {
  it("should create an instance of NotFoundError with a single ID", () => {
    const entity = new StubEntity();

    const error = new NotFoundError(entity.entityId.toString(), StubEntity);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe(
      `StubEntity Not Found using ID: ${entity.entityId.toString()}`,
    );
    expect(error.name).toBe("NotFoundError");
  });

  it("should create an instance of NotFoundError with multiple IDs", () => {
    const entity1 = new StubEntity();
    const entity2 = new StubEntity();

    const error = new NotFoundError(
      [entity1.entityId.toString(), entity2.entityId.toString()],
      StubEntity,
    );
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe(
      `StubEntity Not Found using IDs: ${entity1.entityId.toString()}, ${entity2.entityId.toString()}`,
    );
    expect(error.name).toBe("NotFoundError");
  });
});
