import { Entity } from "../shared/entity";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { EndpointFakeBuilder } from "./endpoint-fake.builder";
import { HttpMethod, ResponseBodyType } from "./endpoint.types";
import {
  EndpointValidationGroup,
  EndpointValidator,
} from "./endpoint.validator";

type ConstructorProps = {
  endpoint_id?: Uuid;
  method: HttpMethod;
  title: string;
  description?: string;
  statusCode: number;
  delay?: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
  created_at?: Date;
};

export class Endpoint extends Entity {
  endpoint_id: Uuid;
  method: HttpMethod;
  title: string;
  description: string;
  delay?: number;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
  created_at: Date;

  constructor(props: ConstructorProps) {
    super();

    this.endpoint_id = props.endpoint_id ?? new Uuid();
    this.method = props.method;
    this.title = props.title;
    this.description = props.description ?? "";
    this.delay = props.delay ?? 0;
    this.statusCode = props.statusCode;
    this.created_at = props.created_at ?? new Date();

    const allowBody = Endpoint.statusCodeAllowsBody(props.statusCode);

    if (allowBody) {
      this.responseBodyType = props.responseBodyType;

      if (props.responseBodyType === ResponseBodyType.JSON) {
        this.responseJson = props.responseJson ?? "{}";
      }

      if (props.responseBodyType === ResponseBodyType.TEXT) {
        this.responseText = props.responseText ?? "";
      }
    }
  }

  changeMethod(method: HttpMethod) {
    this.method = method;
    this.validate(["method"]);
  }

  changeTitle(title: string) {
    this.title = title;
    this.validate(["title"]);
  }

  changeDescription(description?: string) {
    this.description = description ?? "";
    this.validate(["description"]);
  }

  changeDelay(delay?: number) {
    this.delay = delay;
    this.validate(["delay"]);
  }

  changeStatusCode(statusCode: number) {
    // TODO: IMPLEMENTAR EVENT EMITTER
    this.statusCode = statusCode;

    this.validate(["statusCode"]);

    const hadBody = !!this.responseBodyType;
    const allowBody = Endpoint.statusCodeAllowsBody(statusCode);

    if (hadBody && !allowBody) {
      this.responseBodyType = undefined;
      this.responseJson = undefined;
      this.responseText = undefined;

      this.validate(["responseBodyType", "responseJson", "responseText"]);
      return;
    }

    if (!hadBody && allowBody) {
      this.responseBodyType = ResponseBodyType.EMPTY;
      this.validate(["responseBodyType"]);
      return;
    }
  }

  changeResponseBodyType(responseBodyType: ResponseBodyType) {
    // TODO: IMPLEMENTAR EVENT EMITTER
    const statusCodeAllowsBody = Endpoint.statusCodeAllowsBody(this.statusCode);

    if (!statusCodeAllowsBody) {
      throw new Error(
        "Status code does not allow body, cannot set response body type",
      );
    }

    this.responseBodyType = responseBodyType;

    this.validate(["responseBodyType"]);

    switch (responseBodyType) {
      case ResponseBodyType.JSON:
        this.responseText = undefined;
        this.responseJson = this.responseJson ?? "{}";
        break;

      case ResponseBodyType.TEXT:
        this.responseJson = undefined;
        this.responseText = this.responseText ?? "";
        break;

      case ResponseBodyType.NULL:
        this.responseJson = undefined;
        this.responseText = undefined;
        break;
      case ResponseBodyType.EMPTY:
        this.responseJson = undefined;
        this.responseText = undefined;
        break;
    }

    this.validate(["responseJson", "responseText"]);
  }

  changeResponseJson(responseJson?: string) {
    if (this.responseBodyType !== ResponseBodyType.JSON) {
      throw new Error("Response body type must be JSON to set responseJson");
    }

    this.responseJson = responseJson ?? "{}";

    this.validate(["responseJson"]);
  }

  changeResponseText(responseText?: string) {
    if (this.responseBodyType !== ResponseBodyType.TEXT) {
      throw new Error("Response body type must be TEXT to set responseText");
    }

    this.responseText = responseText ?? "";
    this.validate(["responseText"]);
  }

  validate(fields?: EndpointValidationGroup[]) {
    const validator = new EndpointValidator();

    return validator.validate(this.notification, this, fields);
  }

  static statusCodeAllowsBody(statusCode: number) {
    const statusCodesWithoutBody = [
      ...Array.from({ length: 100 }, (_, i) => i + 100),
      204,
      205,
      304,
    ];

    return !statusCodesWithoutBody.includes(statusCode);
  }

  get entity_id() {
    return this.endpoint_id;
  }

  toJSON() {
    return {
      endpoint_id: this.endpoint_id.toString(),
      title: this.title,
      method: this.method,
      description: this.description,
      statusCode: this.statusCode,
      delay: this.delay,

      ...(this.responseBodyType && { responseBodyType: this.responseBodyType }),
      ...(this.responseJson && { responseJson: this.responseJson }),
      ...(this.responseText && { responseText: this.responseText }),

      created_at: this.created_at,
    };
  }
}

type CreateCommandProps = {
  method: HttpMethod;
  title: string;
  description?: string;
  delay?: number;
  statusCode: number;
  responseBodyType: ResponseBodyType;
  responseJson?: string;
  responseText?: string;
};

export class EndpointFactory {
  static create(props: CreateCommandProps) {
    const endpoint = new Endpoint(props);

    endpoint.validate();

    return endpoint;
  }

  static fake() {
    return EndpointFakeBuilder;
  }
}
