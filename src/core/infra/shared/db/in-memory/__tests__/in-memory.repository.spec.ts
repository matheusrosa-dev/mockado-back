import { NotFoundError } from "../../../../../domain/shared/errors/not-found.error";
import { Entity } from "../../../../../domain/shared/entity";
import { Uuid } from "../../../../../domain/shared/value-objects/uuid.vo";
import { InMemoryRepository } from "../in-memory.repository";

type ConstructorProps = {
  entity_id?: Uuid;
  name: string;
  price: number;
};

class StubEntity extends Entity {
  entity_id: Uuid;
  name: string;
  price: number;

  constructor(props: ConstructorProps) {
    super();
    this.entity_id = props.entity_id || new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON() {
    return {
      entity_id: this.entity_id.id,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity() {
    return StubEntity;
  }
}

describe("In Memory Repository - Unit Tests", () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  it("should insert a new entity", async () => {
    const entity = new StubEntity({
      entity_id: new Uuid(),
      name: "Test",
      price: 100,
    });

    await repository.insert(entity);

    expect(repository.items.length).toBe(1);
    expect(repository.items[0]).toBe(entity);
  });

  it("should return all entities", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repository.insert(entity);

    const entities = await repository.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it("should throw an error on update when entity not found", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity),
    );
  });

  it("should update an entity", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repository.insert(entity);

    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: "updated",
      price: 1,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it("should throw an error on delete when entity not found", async () => {
    const uuid = new Uuid();
    await expect(repository.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid, StubEntity),
    );

    await expect(
      repository.delete(new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104")),
    ).rejects.toThrow(
      new NotFoundError(
        new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104"),
        StubEntity,
      ),
    );
  });

  it("should delete an entity", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repository.insert(entity);

    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);
  });

  it("should return an entity by id", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repository.insert(entity);

    const found = await repository.findById(entity.entity_id);
    expect(found).toBe(entity);
  });

  it("should return null when entity is not found by id", async () => {
    const found = await repository.findById(new Uuid());
    expect(found).toBeNull();
  });
});
