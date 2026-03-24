import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "../user-typeorm.model";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("User Model - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [UserModel, RefreshTokenModel, EndpointModel],
  });

  test("mapping props", () => {
    const metadata = dataSource.getMetadata(UserModel);
    const columns = metadata.columns;

    const columnNames = columns.map((column) => column.propertyName);
    expect(columnNames).toStrictEqual([
      "userId",
      "googleId",
      "email",
      "name",
      "isActive",
      "createdAt",
    ]);

    const userIdColumn = columns.find(
      (column) => column.propertyName === "userId",
    );
    expect(userIdColumn).toMatchObject({
      isPrimary: true,
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

    const emailColumn = columns.find(
      (column) => column.propertyName === "email",
    );
    expect(emailColumn).toMatchObject({
      type: "varchar",
      length: "255",
      isNullable: false,
    });

    const uniqueColumnNames = metadata.uniques.flatMap((uniqueConstraint) =>
      uniqueConstraint.columns.map((column) => column.propertyName),
    );
    expect(uniqueColumnNames).toContain("googleId");
    expect(uniqueColumnNames).toContain("email");

    const nameColumn = columns.find((column) => column.propertyName === "name");
    expect(nameColumn).toMatchObject({
      type: "varchar",
      length: "100",
      isNullable: false,
    });

    const isActiveColumn = columns.find(
      (column) => column.propertyName === "isActive",
    );
    expect(isActiveColumn).toMatchObject({
      type: "boolean",
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
    const metadata = dataSource.getMetadata(UserModel);
    const relations = metadata.relations;

    expect(relations).toHaveLength(2);

    const refreshTokensRelation = relations.find(
      (relation) => relation.propertyName === "refreshTokens",
    );
    expect(refreshTokensRelation).toMatchObject({
      relationType: "one-to-many",
    });
    expect(refreshTokensRelation?.inverseEntityMetadata.target).toBe(
      RefreshTokenModel,
    );

    const endpointsRelation = relations.find(
      (relation) => relation.propertyName === "endpoints",
    );
    expect(endpointsRelation).toMatchObject({
      relationType: "one-to-many",
    });
    expect(endpointsRelation?.inverseEntityMetadata.target).toBe(EndpointModel);
  });
});
