/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { Endpoint, EndpointFactory } from "../endpoint.entity";
import { HttpMethod, ResponseBodyType } from "../endpoint.types";
import { Uuid } from "../../shared/value-objects/uuid.vo";

const STATUS_CODES_WITHOUT_BODY = [
  ...Array.from({ length: 100 }, (_, i) => i + 100),
  204,
  205,
  304,
];

const STATUS_CODES_WITH_BODY = Array.from(
  { length: 412 },
  (_, i) => i + 100,
).filter((code) => !STATUS_CODES_WITHOUT_BODY.includes(code));

describe("Endpoint Entity - Unit Tests", () => {
  describe("statusCodeAllowsBody", () => {
    it("should return false for status codes that do not allow body", () => {
      STATUS_CODES_WITHOUT_BODY.forEach((statusCode) => {
        expect(Endpoint.statusCodeAllowsBody(statusCode)).toBe(false);
      });
    });

    it("should return true for status codes that allow body", () => {
      STATUS_CODES_WITH_BODY.forEach((statusCode) => {
        expect(Endpoint.statusCodeAllowsBody(statusCode)).toBe(true);
      });
    });
  });

  describe("constructor", () => {
    it.each(
      Object.values(HttpMethod),
    )("should instance an endpoint with method %s", (method) => {
      const requiredProps = {
        method,
        title: "My Endpoint",
        statusCode: 100,
      };

      const endpoint = new Endpoint(requiredProps);

      expect(endpoint.method).toBe(requiredProps.method);
      expect(endpoint.title).toBe(requiredProps.title);
      expect(endpoint.statusCode).toBe(requiredProps.statusCode);
    });

    it.each(
      Object.values(ResponseBodyType),
    )("should instance an endpoint with response body type %s", (responseBodyType) => {
      const endpoint = new Endpoint({
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        responseBodyType,
      });

      expect(endpoint.responseBodyType).toBe(responseBodyType);
    });

    it("should ignore body on provide it to an endpoint which does not allow body", () => {
      const endpointProps = {
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 204,
      };

      const endpoint = new Endpoint({
        ...endpointProps,
        responseBodyType: ResponseBodyType.JSON,
        responseJson: '{"key":"value"}',
        responseText: "some text",
      });

      expect(endpoint.method).toBe(endpointProps.method);
      expect(endpoint.title).toBe(endpointProps.title);
      expect(endpoint.statusCode).toBe(endpointProps.statusCode);
      expect(endpoint.responseBodyType).toBeUndefined();
      expect(endpoint.responseJson).toBeUndefined();
      expect(endpoint.responseText).toBeUndefined();
    });

    it("should set default values when not provided", () => {
      const endpoint1 = new Endpoint({
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        responseBodyType: ResponseBodyType.JSON,
      });

      expect(endpoint1.entity_id).toBeInstanceOf(Uuid);
      expect(endpoint1.description).toBe("");
      expect(endpoint1.delay).toBe(0);
      expect(endpoint1.responseJson).toBe("{}");
      expect(endpoint1.createdAt).toBeInstanceOf(Date);

      const endpoint2 = new Endpoint({
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        responseBodyType: ResponseBodyType.TEXT,
      });

      expect(endpoint2.responseText).toBe("");
    });

    it("should set endpoint_id and createdAt when provided", () => {
      const id = new Uuid();
      const date = new Date("2024-01-01");

      const endpoint = new Endpoint({
        endpoint_id: id,
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        createdAt: date,
      });

      expect(endpoint.entity_id.equals(id)).toBeTruthy();
      expect(endpoint.createdAt).toBe(date);
    });

    it("should set optional props when provided", () => {
      const endpoint1 = new Endpoint({
        method: HttpMethod.GET,
        responseBodyType: ResponseBodyType.JSON,
        title: "My Endpoint",
        statusCode: 200,
        description: "A description",
        delay: 5,
        responseJson: '{"key":"value"}',
      });

      expect(endpoint1.description).toBe("A description");
      expect(endpoint1.delay).toBe(5);
      expect(endpoint1.responseJson).toBe('{"key":"value"}');

      const endpoint2 = new Endpoint({
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        responseBodyType: ResponseBodyType.TEXT,
        responseText: "some text",
      });

      expect(endpoint2.responseText).toBe("some text");
    });
  });

  describe("endpoint_id", () => {
    it("should return endpoint_id", () => {
      const id = new Uuid();
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withEndpointId(id)
        .build();

      expect(endpoint.entity_id).toBe(id);
    });
  });

  describe("changeMethod", () => {
    it("should change the method and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeMethod(HttpMethod.POST);

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.method).toBe(HttpMethod.POST);
    });
  });

  describe("changeTitle", () => {
    it("should change the title and validate", () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeTitle("New Title");

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.title).toBe("New Title");
    });
  });

  describe("changeDescription", () => {
    it("should change the description and validate", () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeDescription("New Description");

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.description).toBe("New Description");
    });

    it("should reset description to empty string when called with undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDescription("Some description")
        .build();

      endpoint.changeDescription(undefined);

      expect(endpoint.description).toBe("");
      expect(endpoint.notification.hasErrors()).toBe(false);
    });
  });

  describe("changeDelay", () => {
    it("should change the delay and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(1)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeDelay(5);

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.delay).toBe(5);
    });

    it("should reset delay to 0 when called with undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(5)
        .build();

      endpoint.changeDelay(undefined);

      expect(endpoint.delay).toBe(0);
      expect(endpoint.notification.hasErrors()).toBe(false);
    });
  });

  describe("changeStatusCode", () => {
    it("should change the status code and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeStatusCode(404);

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.statusCode).toBe(404);
    });

    it("should remove response body fields when changing to a status code that does not allow body", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeStatusCode(204);

      expect(spyValidate).toHaveBeenCalledTimes(2);
      expect(endpoint.statusCode).toBe(204);
      expect(endpoint.responseBodyType).toBeUndefined();
      expect(endpoint.responseJson).toBeUndefined();
      expect(endpoint.responseText).toBeUndefined();
    });

    it("should preserve response body fields when changing between body-compatible status codes", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      endpoint.changeStatusCode(201);

      expect(endpoint.statusCode).toBe(201);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(endpoint.responseJson).toBe('{"key":"value"}');
    });

    it("should set response body type to empty when changing to a status code that allows body and had no body", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(204)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeStatusCode(200);

      expect(spyValidate).toHaveBeenCalledTimes(2);
      expect(endpoint.statusCode).toBe(200);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.EMPTY);
      expect(endpoint.responseJson).toBeUndefined();
      expect(endpoint.responseText).toBeUndefined();
    });
  });

  describe("changeResponseBodyType", () => {
    it("should change the response body type and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseBodyType(ResponseBodyType.JSON);

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.JSON);
    });

    it("should throw error when trying to set response body type for a status code that does not allow body", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(204)
        .build();

      expect(() =>
        endpoint.changeResponseBodyType(ResponseBodyType.JSON),
      ).toThrow(
        "Status code does not allow body, cannot set response body type",
      );
      expect(endpoint.responseBodyType).toBeUndefined();
    });

    it("should set responseJson to default when changing to JSON type", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseBodyType(ResponseBodyType.JSON);

      expect(spyValidate).toHaveBeenCalledTimes(2);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.JSON);
      expect(endpoint.responseJson).toBe("{}");
      expect(endpoint.responseText).toBeUndefined();
    });

    it("should set responseText to default when changing to TEXT type", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.EMPTY)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseBodyType(ResponseBodyType.TEXT);

      expect(spyValidate).toHaveBeenCalledTimes(2);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.TEXT);
      expect(endpoint.responseText).toBe("");
      expect(endpoint.responseJson).toBeUndefined();
    });

    it("should unset responseJson and responseText when changing to NULL or EMPTY type", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseBodyType(ResponseBodyType.NULL);

      expect(spyValidate).toHaveBeenCalledTimes(2);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.NULL);
      expect(endpoint.responseJson).toBeUndefined();
      expect(endpoint.responseText).toBeUndefined();

      endpoint.changeResponseBodyType(ResponseBodyType.EMPTY);

      expect(spyValidate).toHaveBeenCalledTimes(4);
      expect(endpoint.responseBodyType).toBe(ResponseBodyType.EMPTY);
      expect(endpoint.responseJson).toBeUndefined();
      expect(endpoint.responseText).toBeUndefined();
    });
  });

  describe("changeResponseJson", () => {
    it("should change the responseJson and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseJson('{"key":"value"}');

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.responseJson).toBe('{"key":"value"}');
    });

    it("should throw error when trying to set responseJson for an endpoint that does not have JSON body type", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .build();

      expect(() => endpoint.changeResponseJson('{"key":"value"}')).toThrow(
        "Response body type must be JSON to set responseJson",
      );
      expect(endpoint.responseJson).toBeUndefined();
    });

    it("should default responseJson to '{}' when called with undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"key":"value"}')
        .build();

      endpoint.changeResponseJson(undefined);

      expect(endpoint.responseJson).toBe("{}");
      expect(endpoint.notification.hasErrors()).toBe(false);
    });
  });

  describe("changeResponseText", () => {
    it("should change the responseText and validate", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .build();

      const spyValidate = jest.spyOn(endpoint, "validate");

      endpoint.changeResponseText("Some text");

      expect(spyValidate).toHaveBeenCalled();
      expect(endpoint.responseText).toBe("Some text");
    });

    it("should throw error when trying to set responseText for an endpoint that does not have TEXT body type", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .build();

      expect(() => endpoint.changeResponseText("Some text")).toThrow(
        "Response body type must be TEXT to set responseText",
      );
      expect(endpoint.responseText).toBeUndefined();
    });

    it("should default responseText to empty string when called with undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("some text")
        .build();

      endpoint.changeResponseText(undefined);

      expect(endpoint.responseText).toBe("");
      expect(endpoint.notification.hasErrors()).toBe(false);
    });
  });

  describe("_onStatusCodeModified", () => {
    it("should execute when status code is changed", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .build();

      const spyOnStatusCodeModified = jest.spyOn(
        endpoint as any,
        "_onStatusCodeModified",
      );

      endpoint.changeStatusCode(204);

      expect(spyOnStatusCodeModified).toHaveBeenCalled();
    });
  });

  describe("_onResponseBodyTypeModified", () => {
    it("should execute when response body type is changed", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .build();

      const spyOnResponseBodyTypeModified = jest.spyOn(
        endpoint as any,
        "_onResponseBodyTypeModified",
      );

      endpoint.changeResponseBodyType(ResponseBodyType.JSON);

      expect(spyOnResponseBodyTypeModified).toHaveBeenCalled();
    });
  });

  describe("toJSON", () => {
    it("should return a plain object with all fields", () => {
      const endpointWithoutBody = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(204)
        .build();

      expect(endpointWithoutBody.toJSON()).toEqual({
        endpoint_id: endpointWithoutBody.entity_id.id,
        title: endpointWithoutBody.title,
        method: endpointWithoutBody.method,
        description: endpointWithoutBody.description,
        delay: endpointWithoutBody.delay,
        statusCode: endpointWithoutBody.statusCode,
        createdAt: endpointWithoutBody.createdAt,
      });

      const endpointWithJson = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod(HttpMethod.GET)
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson('{"a":1}')
        .build();

      expect(endpointWithJson.toJSON()).toEqual({
        endpoint_id: endpointWithJson.entity_id.id,
        title: endpointWithJson.title,
        method: endpointWithJson.method,
        description: endpointWithJson.description,
        delay: endpointWithJson.delay,
        statusCode: endpointWithJson.statusCode,
        responseBodyType: endpointWithJson.responseBodyType,
        responseJson: endpointWithJson.responseJson,
        createdAt: endpointWithJson.createdAt,
      });

      const endpointWithText = new Endpoint({
        endpoint_id: new Uuid(),
        method: HttpMethod.GET,
        title: "My Endpoint",
        statusCode: 200,
        responseBodyType: ResponseBodyType.TEXT,
        description: "desc",
        delay: 2,
        responseText: "text",
        createdAt: new Date("2024-01-01"),
      });

      expect(endpointWithText.toJSON()).toEqual({
        endpoint_id: endpointWithText.entity_id.id,
        title: endpointWithText.title,
        method: endpointWithText.method,
        description: endpointWithText.description,
        delay: endpointWithText.delay,
        statusCode: endpointWithText.statusCode,
        responseBodyType: endpointWithText.responseBodyType,
        responseText: endpointWithText.responseText,
        createdAt: endpointWithText.createdAt,
      });
    });
  });

  describe("validate", () => {
    it("should call validate on create with factory", () => {
      const spyValidate = jest.spyOn(Endpoint.prototype, "validate");

      EndpointFactory.fake().oneEndpoint().build();

      expect(spyValidate).toHaveBeenCalled();
    });

    it("should have no errors for valid props", () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      expect(endpoint.notification.hasErrors()).toBe(false);
    });

    it("should add error when title is empty", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withTitle("")
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("title")).toContain(
        "title should not be empty",
      );
    });

    it("should add error when title exceeds 50 characters", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withTitle("a".repeat(51))
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("title")).toContain(
        "title must be shorter than or equal to 50 characters",
      );
    });

    it("should add error when method is invalid", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withMethod("INVALID" as HttpMethod)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("method")).toContain(
        "method must be one of the following values: GET, POST, PUT, DELETE, PATCH",
      );
    });

    it("should add error when description exceeds 200 characters", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDescription("a".repeat(201))
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("description")).toContain(
        "description must be shorter than or equal to 200 characters",
      );
    });

    it("should not add error when description is undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDescription(undefined)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(false);
    });

    it("should add error when delay is below 0", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(-1)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("delay")).toContain(
        "delay must not be less than 0",
      );
    });

    it("should add error when delay exceeds 10", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(11)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("delay")).toContain(
        "delay must not be greater than 10",
      );
    });

    it("should add error when delay is not number", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay("" as any)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("delay")).toContain(
        "delay must be an integer number",
      );
    });

    it("should add error when delay is not integer", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(1.1)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("delay")).toContain(
        "delay must be an integer number",
      );
    });

    it("should not add error when delay is undefined (defaults to 0)", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withDelay(undefined)
        .build();

      expect(endpoint.delay).toBe(0);
      expect(endpoint.notification.hasErrors()).toBe(false);
    });

    it("should add error when statusCode is below 100", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(99)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("statusCode")).toContain(
        "statusCode must not be less than 100",
      );
    });

    it("should add error when statusCode exceeds 511", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(512)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("statusCode")).toContain(
        "statusCode must not be greater than 511",
      );
    });

    it("should add error when responseBodyType is invalid", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200) // Status code that allows body
        .withResponseBodyType("invalid" as ResponseBodyType)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("responseBodyType")).toContain(
        "responseBodyType must be one of the following values: json, text, null, empty",
      );
    });

    it("should add error when responseJson is not valid JSON", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200) // Status code that allows body
        .withResponseBodyType(ResponseBodyType.JSON)
        .withResponseJson("not-json")
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("responseJson")).toContain(
        "responseJson must be a json string",
      );
    });

    it("should add error when responseText exceeds 1000 characters", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText("a".repeat(1001))
        .build();

      expect(endpoint.notification.hasErrors()).toBe(true);
      expect(endpoint.notification.errors.size).toBe(1);
      expect(endpoint.notification.errors.get("responseText")).toContain(
        "responseText must be shorter than or equal to 1000 characters",
      );
    });

    it("should not add error when responseText is undefined", () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(200)
        .withResponseBodyType(ResponseBodyType.TEXT)
        .withResponseText(undefined as any)
        .build();

      expect(endpoint.notification.hasErrors()).toBe(false);
    });
  });
});
