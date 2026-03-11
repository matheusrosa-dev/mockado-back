import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "../user-typeorm.model";

describe("User Model - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [UserModel, RefreshTokenModel],
  });

  test("mapping props", () => {
    const metadata = dataSource.getMetadata(UserModel);
    const columns = metadata.columns;

    const columnNames = columns.map((c) => c.propertyName);
    expect(columnNames).toStrictEqual([
      "userId",
      "googleId",
      "email",
      "name",
      "picture",
      "isActive",
      "createdAt",
    ]);

    const userIdColumn = columns.find((c) => c.propertyName === "userId");
    expect(userIdColumn).toMatchObject({
      isPrimary: true,
      type: "uuid",
      isNullable: false,
    });

    const googleIdColumn = columns.find((c) => c.propertyName === "googleId");
    expect(googleIdColumn).toMatchObject({
      type: "varchar",
      length: "255",
      isNullable: false,
    });

    const emailColumn = columns.find((c) => c.propertyName === "email");
    expect(emailColumn).toMatchObject({
      type: "varchar",
      length: "255",
      isNullable: false,
    });

    const uniqueColumnNames = metadata.uniques.flatMap((u) =>
      u.columns.map((c) => c.propertyName),
    );
    expect(uniqueColumnNames).toContain("googleId");
    expect(uniqueColumnNames).toContain("email");

    const nameColumn = columns.find((c) => c.propertyName === "name");
    expect(nameColumn).toMatchObject({
      type: "varchar",
      length: "100",
      isNullable: false,
    });

    const pictureColumn = columns.find((c) => c.propertyName === "picture");
    expect(pictureColumn).toMatchObject({
      type: "varchar",
      length: "500",
      isNullable: true,
    });

    const isActiveColumn = columns.find((c) => c.propertyName === "isActive");
    expect(isActiveColumn).toMatchObject({
      type: "boolean",
      isNullable: false,
    });

    const createdAtColumn = columns.find((c) => c.propertyName === "createdAt");
    expect(createdAtColumn).toMatchObject({
      isCreateDate: true,
    });
  });

  test("relations", () => {
    const metadata = dataSource.getMetadata(UserModel);
    const relations = metadata.relations;

    expect(relations).toHaveLength(1);

    const refreshTokensRelation = relations.find(
      (r) => r.propertyName === "refreshTokens",
    );
    expect(refreshTokensRelation).toMatchObject({
      relationType: "one-to-many",
    });
    expect(refreshTokensRelation?.inverseEntityMetadata.target).toBe(
      RefreshTokenModel,
    );
  });
});
