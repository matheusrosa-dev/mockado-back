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
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  it("should insert a new entity", async () => {
    const entity = new StubEntity({
      entity_id: new Uuid(),
      name: "Test",
      price: 100,
    });

    await repo.insert(entity);

    expect(repo.items.length).toBe(1);
    expect(repo.items[0]).toBe(entity);
  });

  it("should bulk insert entities", async () => {
    const entities = [
      new StubEntity({
        entity_id: new Uuid(),
        name: "First",
        price: 100,
      }),
      new StubEntity({
        entity_id: new Uuid(),
        name: "Second",
        price: 200,
      }),
    ];

    await repo.bulkInsert(entities);

    expect(repo.items.length).toBe(2);
    expect(repo.items[0]).toBe(entities[0]);
    expect(repo.items[1]).toBe(entities[1]);
  });

  it("should return all entities", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repo.insert(entity);

    const entities = await repo.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it("should throw an error on update when entity not found", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await expect(repo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity),
    );
  });

  it("should update an entity", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repo.insert(entity);

    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: "updated",
      price: 1,
    });
    await repo.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repo.items[0].toJSON());
  });

  it("should throw an error on delete when entity not found", async () => {
    const uuid = new Uuid();
    await expect(repo.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid, StubEntity),
    );

    await expect(
      repo.delete(new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104")),
    ).rejects.toThrow(
      new NotFoundError(
        new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104"),
        StubEntity,
      ),
    );
  });

  it("should delete an entity", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repo.insert(entity);

    await repo.delete(entity.entity_id);
    expect(repo.items).toHaveLength(0);
  });

  it("should return an entity by id", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repo.insert(entity);

    const found = await repo.findById(entity.entity_id);
    expect(found).toBe(entity);
  });

  it("should return null when entity is not found by id", async () => {
    const found = await repo.findById(new Uuid());
    expect(found).toBeNull();
  });

  it("should return entities by ids", async () => {
    const entities = [
      new StubEntity({ name: "First", price: 10 }),
      new StubEntity({ name: "Second", price: 20 }),
      new StubEntity({ name: "Third", price: 30 }),
    ];
    await repo.bulkInsert(entities);

    const found = await repo.findByIds([
      entities[0].entity_id,
      entities[2].entity_id,
    ]);
    expect(found).toHaveLength(2);
    expect(found).toContain(entities[0]);
    expect(found).toContain(entities[2]);
  });

  it("should return only existing entities when some ids are not found", async () => {
    const entity = new StubEntity({ name: "name value", price: 5 });
    await repo.insert(entity);

    const found = await repo.findByIds([entity.entity_id, new Uuid()]);
    expect(found).toHaveLength(1);
    expect(found[0]).toBe(entity);
  });
});
