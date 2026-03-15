import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { RefreshTokenModel } from "../refresh-token-typeorm.model";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("Refresh Token Model - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [UserModel, RefreshTokenModel, EndpointModel],
  });

  test("mapping props", () => {
    const metadata = dataSource.getMetadata(RefreshTokenModel);
    const columns = metadata.columns;

    const columnNames = columns.map((column) => column.propertyName);
    expect(columnNames).toStrictEqual([
      "refreshTokenId",
      "userId",
      "googleId",
      "refreshTokenHash",
      "createdAt",
    ]);

    const refreshTokenIdColumn = columns.find(
      (column) => column.propertyName === "refreshTokenId",
    );
    expect(refreshTokenIdColumn).toMatchObject({
      isPrimary: true,
      type: "uuid",
      isNullable: false,
    });

    const userIdColumn = columns.find(
      (column) => column.propertyName === "userId",
    );
    expect(userIdColumn).toMatchObject({
      type: "uuid",
      isNullable: false,
    });

    const googleIdColumn = columns.find(
      (column) => column.propertyName === "googleId",
    );
    expect(googleIdColumn).toMatchObject({
      type: "varchar",
      length: "255",
      isNullable: false,
    });

    const refreshTokenHashColumn = columns.find(
      (column) => column.propertyName === "refreshTokenHash",
    );
    expect(refreshTokenHashColumn).toMatchObject({
      type: "varchar",
      length: "500",
      isNullable: false,
    });

    const createdAtColumn = columns.find(
      (column) => column.propertyName === "createdAt",
    );
    expect(createdAtColumn).toMatchObject({
      isCreateDate: true,
    });
  });

  test("relations", () => {
    const metadata = dataSource.getMetadata(RefreshTokenModel);
    const relations = metadata.relations;

    expect(relations).toHaveLength(1);

    const userRelation = relations.find(
      (relation) => relation.propertyName === "user",
    );
    expect(userRelation).toMatchObject({
      relationType: "many-to-one",
      isNullable: false,
      onDelete: "CASCADE",
    });
    expect(userRelation?.inverseEntityMetadata.target).toBe(UserModel);
  });
});
