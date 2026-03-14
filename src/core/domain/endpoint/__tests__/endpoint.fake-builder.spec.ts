import { Uuid } from "../../shared/value-objects/uuid.vo";
import { EndpointFactory } from "../endpoint.entity";
import { HttpMethod, ResponseBodyType } from "../endpoint.types";
import { StatusCode } from "../value-objects/status-code.vo";

describe("Endpoint Fake Builder - Unit Tests", () => {
  describe("one endpoint", () => {
    it("should instance a fake endpoint with default values", () => {
      const fakeEndpoint = EndpointFactory.fake().oneEndpoint().build();

      expect(fakeEndpoint.toJSON()).toEqual({
        endpointId: fakeEndpoint.endpointId.toString(),
        userId: fakeEndpoint.userId.toString(),
        method: fakeEndpoint.method,
        title: fakeEndpoint.title,
        description: fakeEndpoint.description,
        delay: fakeEndpoint.delay,
        statusCode: fakeEndpoint.statusCode.statusCode,
        responseBodyType: fakeEndpoint.responseBodyType,
        responseJson: fakeEndpoint.responseJson,
        responseText: fakeEndpoint.responseText,
        createdAt: fakeEndpoint.createdAt,
      });
    });

    it("should instance a fake endpoint with custom values", () => {
      const id = new Uuid();
      const userId = new Uuid();

      // Custom values
      const fakeEndpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withEndpointId(id)
        .withUserId(userId)
        .withTitle("Custom Title")
        .withMethod(HttpMethod.POST)
        .withDescription("Custom Description")
        .withStatusCode(new StatusCode(204))
        .withDelay(2)
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeEndpoint.endpointId.equals(id)).toBeTruthy();
      expect(fakeEndpoint.userId.equals(userId)).toBeTruthy();
      expect(fakeEndpoint.title).toBe("Custom Title");
      expect(fakeEndpoint.method).toBe(HttpMethod.POST);
      expect(fakeEndpoint.description).toBe("Custom Description");
      expect(fakeEndpoint.statusCode.statusCode).toBe(204);
      expect(fakeEndpoint.delay).toBe(2);
      expect(fakeEndpoint.createdAt).toEqual(new Date("2024-01-01"));

      // JSON response
      const fakeEndpointWithJson = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson(JSON.stringify({ message: "Hello, World!" }))
        .build();

      expect(fakeEndpointWithJson.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(fakeEndpointWithJson.responseJson).toBe(
        JSON.stringify({ message: "Hello, World!" }),
      );

      // Text response
      const fakeEndpointWithText = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("Hello, World!")
        .build();

      expect(fakeEndpointWithText.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(fakeEndpointWithText.responseText).toBe("Hello, World!");

      // Empty response
      const fakeEndpointWithEmpty = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      expect(fakeEndpointWithEmpty.responseBodyType).toBe(
        ResponseBodyType.EMPTY,
      );
      expect(fakeEndpointWithEmpty.responseJson).toBeUndefined();
      expect(fakeEndpointWithEmpty.responseText).toBeUndefined();

      // Null response
      const fakeEndpointWithNull = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.NULL)
        .build();

      expect(fakeEndpointWithNull.responseBodyType).toBe(ResponseBodyType.NULL);
      expect(fakeEndpointWithNull.responseJson).toBeUndefined();
      expect(fakeEndpointWithNull.responseText).toBeUndefined();
    });
  });

  describe("many endpoints", () => {
    it("should instance an array of fake endpoints with default values", () => {
      const amount = 5;
      const fakeEndpoints = EndpointFactory.fake()
        .manyEndpoints(amount)
        .build();

      expect(fakeEndpoints).toHaveLength(amount);
      fakeEndpoints.forEach((endpoint) => {
        expect(endpoint.endpointId.toString()).toBeDefined();
        expect(endpoint.userId.toString()).toBeDefined();
        expect(endpoint.title).toBeDefined();
        expect(endpoint.method).toBeDefined();
        expect(endpoint.statusCode).toBeDefined();
        expect(endpoint.createdAt).toBeDefined();
      });
    });

    it("should instance an array of fake endpoints with custom values", () => {
      const id = new Uuid();
      const userId = new Uuid();
      const amount = 3;

      // Custom values
      const fakeEndpoints = EndpointFactory.fake()
        .manyEndpoints(amount)
        .withEndpointId(id)
        .withUserId(userId)
        .withTitle("Custom Title")
        .withMethod(HttpMethod.POST)
        .withDescription("Custom Description")
        .withStatusCode(new StatusCode(204))
        .withDelay(2)
        .withCreatedAt(new Date("2024-01-01"))
        .build();

      expect(fakeEndpoints).toHaveLength(amount);
      fakeEndpoints.forEach((endpoint) => {
        expect(endpoint.endpointId.equals(id)).toBeTruthy();
        expect(endpoint.userId.equals(userId)).toBeTruthy();
        expect(endpoint.title).toBe("Custom Title");
        expect(endpoint.method).toBe(HttpMethod.POST);
        expect(endpoint.description).toBe("Custom Description");
        expect(endpoint.statusCode.statusCode).toBe(204);
        expect(endpoint.delay).toBe(2);
        expect(endpoint.createdAt).toEqual(new Date("2024-01-01"));
      });

      // JSON response
      const fakeEndpointsWithJson = EndpointFactory.fake()
        .manyEndpoints(amount)
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson(JSON.stringify({ message: "Hello, World!" }))
        .build();

      expect(fakeEndpointsWithJson).toHaveLength(amount);
      fakeEndpointsWithJson.forEach((endpoint) => {
        expect(endpoint.responseBodyType).toBe(ResponseBodyType.JSON);
        expect(endpoint.responseJson).toBe(
          JSON.stringify({ message: "Hello, World!" }),
        );
      });

      // Text response
      const fakeEndpointsWithText = EndpointFactory.fake()
        .manyEndpoints(amount)
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("Hello, World!")
        .build();

      expect(fakeEndpointsWithText).toHaveLength(amount);
      fakeEndpointsWithText.forEach((endpoint) => {
        expect(endpoint.responseBodyType).toBe(ResponseBodyType.TEXT);
        expect(endpoint.responseText).toBe("Hello, World!");
      });

      // Empty response
      const fakeEndpointsWithEmpty = EndpointFactory.fake()
        .manyEndpoints(amount)
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      expect(fakeEndpointsWithEmpty).toHaveLength(amount);
      fakeEndpointsWithEmpty.forEach((endpoint) => {
        expect(endpoint.responseBodyType).toBe(ResponseBodyType.EMPTY);
        expect(endpoint.responseJson).toBeUndefined();
        expect(endpoint.responseText).toBeUndefined();
      });

      // Null response
      const fakeEndpointsWithNull = EndpointFactory.fake()
        .manyEndpoints(amount)
        .withStatusCode(new StatusCode(200)) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.NULL)
        .build();

      expect(fakeEndpointsWithNull).toHaveLength(amount);
      fakeEndpointsWithNull.forEach((endpoint) => {
        expect(endpoint.responseBodyType).toBe(ResponseBodyType.NULL);
        expect(endpoint.responseJson).toBeUndefined();
        expect(endpoint.responseText).toBeUndefined();
      });
    });
  });
});
