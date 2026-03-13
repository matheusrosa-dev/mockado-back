import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Entity } from "@domain/shared/entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { InMemoryRepository } from "../in-memory.repository";

type ConstructorProps = {
  entityId?: Uuid;
  name: string;
  price: number;
};

class StubEntity extends Entity {
  entityId: Uuid;
  name: string;
  price: number;

  constructor(props: ConstructorProps) {
    super();
    this.entityId = props.entityId || new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON() {
    return {
      entityId: this.entityId.toString(),
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {
  getEntity() {
    return StubEntity;
  }
}

describe("In Memory Repository - Unit Tests", () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  describe("insert()", () => {
    it("should insert a new entity", async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: "Test",
        price: 100,
      });

      await repository.insert(entity);

      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toBe(entity);
    });
  });

  describe("findAll()", () => {
    it("should return all entities", async () => {
      const entity = new StubEntity({ name: "name value", price: 5 });
      await repository.insert(entity);

      const entities = await repository.findAll();

      expect(entities).toStrictEqual([entity]);
    });
  });

  describe("findById()", () => {
    it("should return an entity by id", async () => {
      const entity = new StubEntity({ name: "name value", price: 5 });
      await repository.insert(entity);

      const found = await repository.findById(entity.entityId);
      expect(found).toBe(entity);
    });

    it("should return null when entity is not found by id", async () => {
      const found = await repository.findById(new Uuid());
      expect(found).toBeNull();
    });
  });

  describe("update()", () => {
    it("should throw an error on update when entity not found", async () => {
      const entity = new StubEntity({ name: "name value", price: 5 });
      await expect(repository.update(entity)).rejects.toThrow(
        new NotFoundError(entity.entityId.toString(), StubEntity),
      );
    });

    it("should update an entity", async () => {
      const entity = new StubEntity({ name: "name value", price: 5 });
      await repository.insert(entity);

      const entityUpdated = new StubEntity({
        entityId: entity.entityId,
        name: "updated",
        price: 1,
      });
      await repository.update(entityUpdated);
      expect(entityUpdated.toJSON()).toStrictEqual(
        repository.items[0].toJSON(),
      );
    });
  });

  describe("delete()", () => {
    it("should throw an error on delete when entity not found", async () => {
      const uuid = new Uuid();
      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(uuid.toString(), StubEntity),
      );

      await expect(
        repository.delete(new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104")),
      ).rejects.toThrow(
        new NotFoundError(
          new Uuid("9366b7dc-2d71-4799-b91c-c64adb205104").toString(),
          StubEntity,
        ),
      );
    });

    it("should delete an entity", async () => {
      const entity = new StubEntity({ name: "name value", price: 5 });
      await repository.insert(entity);

      await repository.delete(entity.entityId);
      expect(repository.items).toHaveLength(0);
    });
  });
});
