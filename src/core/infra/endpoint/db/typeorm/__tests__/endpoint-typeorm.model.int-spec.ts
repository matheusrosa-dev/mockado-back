import { HttpMethod, ResponseBodyType } from "@domain/endpoint/endpoint.types";
import { setupTypeOrm } from "../../../../shared/testing/helpers";
import { EndpointModel } from "../endpoint-typeorm.model";

describe("Endpoint Model - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel],
  });

  test("mapping props", () => {
    const metadata = dataSource.getMetadata(EndpointModel);
    const columns = metadata.columns;

    const columnNames = columns.map((column) => column.propertyName);
    expect(columnNames).toStrictEqual([
      "endpointId",
      "title",
      "method",
      "description",
      "delay",
      "statusCode",
      "responseBodyType",
      "responseJson",
      "responseText",
      "createdAt",
    ]);

    const endpointIdColumn = columns.find(
      (column) => column.propertyName === "endpointId",
    );
    expect(endpointIdColumn).toMatchObject({
      isPrimary: true,
      type: "uuid",
      isNullable: false,
    });

    const titleColumn = columns.find(
      (column) => column.propertyName === "title",
    );
    expect(titleColumn).toMatchObject({
      type: "varchar",
      length: "50",
      isNullable: false,
    });

    const methodColumn = columns.find(
      (column) => column.propertyName === "method",
    );
    expect(methodColumn).toMatchObject({
      type: "simple-enum",
      isNullable: false,
      enum: Object.values(HttpMethod),
    });

    const descriptionColumn = columns.find(
      (column) => column.propertyName === "description",
    );
    expect(descriptionColumn).toMatchObject({
      type: "varchar",
      length: "200",
      isNullable: false,
    });

    const delayColumn = columns.find(
      (column) => column.propertyName === "delay",
    );
    expect(delayColumn).toMatchObject({
      type: "int",
      isNullable: false,
    });

    const statusCodeColumn = columns.find(
      (column) => column.propertyName === "statusCode",
    );
    expect(statusCodeColumn).toMatchObject({
      type: "int",
      isNullable: false,
    });

    const responseBodyTypeColumn = columns.find(
      (column) => column.propertyName === "responseBodyType",
    );
    expect(responseBodyTypeColumn).toMatchObject({
      type: "simple-enum",
      isNullable: true,
      enum: Object.values(ResponseBodyType),
    });

    const responseJsonColumn = columns.find(
      (column) => column.propertyName === "responseJson",
    );
    expect(responseJsonColumn).toMatchObject({
      type: "text",
      isNullable: true,
    });

    const responseTextColumn = columns.find(
      (column) => column.propertyName === "responseText",
    );
    expect(responseTextColumn).toMatchObject({
      type: "text",
      isNullable: true,
    });

    const createdAtColumn = columns.find(
      (column) => column.propertyName === "createdAt",
    );
    expect(createdAtColumn).toMatchObject({
      isCreateDate: true,
    });
  });
});
