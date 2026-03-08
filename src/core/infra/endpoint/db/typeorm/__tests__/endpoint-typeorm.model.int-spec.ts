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

    const columnNames = columns.map((c) => c.propertyName);
    expect(columnNames).toStrictEqual([
      "endpoint_id",
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
      (c) => c.propertyName === "endpoint_id",
    );
    expect(endpointIdColumn).toMatchObject({
      isPrimary: true,
      type: "uuid",
      isNullable: false,
    });

    const titleColumn = columns.find((c) => c.propertyName === "title");
    expect(titleColumn).toMatchObject({
      type: "varchar",
      length: "50",
      isNullable: false,
    });

    const methodColumn = columns.find((c) => c.propertyName === "method");
    expect(methodColumn).toMatchObject({
      type: "simple-enum",
      isNullable: false,
      enum: Object.values(HttpMethod),
    });

    const descriptionColumn = columns.find(
      (c) => c.propertyName === "description",
    );
    expect(descriptionColumn).toMatchObject({
      type: "varchar",
      length: "200",
      isNullable: false,
    });

    const delayColumn = columns.find((c) => c.propertyName === "delay");
    expect(delayColumn).toMatchObject({
      type: "int",
      isNullable: false,
    });

    const statusCodeColumn = columns.find(
      (c) => c.propertyName === "statusCode",
    );
    expect(statusCodeColumn).toMatchObject({
      type: "int",
      isNullable: false,
    });

    const responseBodyTypeColumn = columns.find(
      (c) => c.propertyName === "responseBodyType",
    );
    expect(responseBodyTypeColumn).toMatchObject({
      type: "simple-enum",
      isNullable: true,
      enum: Object.values(ResponseBodyType),
    });

    const responseJsonColumn = columns.find(
      (c) => c.propertyName === "responseJson",
    );
    expect(responseJsonColumn).toMatchObject({
      type: "text",
      isNullable: true,
    });

    const responseTextColumn = columns.find(
      (c) => c.propertyName === "responseText",
    );
    expect(responseTextColumn).toMatchObject({
      type: "text",
      isNullable: true,
    });

    const createdAtColumn = columns.find((c) => c.propertyName === "createdAt");
    expect(createdAtColumn).toMatchObject({
      isCreateDate: true,
    });
  });
});
