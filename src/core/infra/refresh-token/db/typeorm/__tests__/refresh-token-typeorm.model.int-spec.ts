import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { RefreshTokenModel } from "../refresh-token-typeorm.model";

describe("Refresh Token Model - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [UserModel, RefreshTokenModel],
  });

  test("mapping props", () => {
    const metadata = dataSource.getMetadata(RefreshTokenModel);
    const columns = metadata.columns;

    const columnNames = columns.map((c) => c.propertyName);
    expect(columnNames).toStrictEqual([
      "refreshTokenId",
      "userId",
      "refreshTokenHash",
      "createdAt",
    ]);

    const refreshTokenIdColumn = columns.find(
      (c) => c.propertyName === "refreshTokenId",
    );
    expect(refreshTokenIdColumn).toMatchObject({
      isPrimary: true,
      type: "uuid",
      isNullable: false,
    });

    const userIdColumn = columns.find((c) => c.propertyName === "userId");
    expect(userIdColumn).toMatchObject({
      type: "uuid",
      isNullable: false,
    });

    const refreshTokenHashColumn = columns.find(
      (c) => c.propertyName === "refreshTokenHash",
    );
    expect(refreshTokenHashColumn).toMatchObject({
      type: "varchar",
      length: "500",
      isNullable: false,
    });

    const createdAtColumn = columns.find((c) => c.propertyName === "createdAt");
    expect(createdAtColumn).toMatchObject({
      isCreateDate: true,
    });
  });

  test("relations", () => {
    const metadata = dataSource.getMetadata(RefreshTokenModel);
    const relations = metadata.relations;

    expect(relations).toHaveLength(1);

    const userRelation = relations.find((r) => r.propertyName === "user");
    expect(userRelation).toMatchObject({
      relationType: "many-to-one",
      isNullable: false,
      onDelete: "CASCADE",
    });
    expect(userRelation?.inverseEntityMetadata.target).toBe(UserModel);
  });
});
