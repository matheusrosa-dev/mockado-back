import { Entity } from "../shared/entity";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { EndpointFakeBuilder } from "./endpoint-fake.builder";
import { HttpMethod, ResponseBodyType } from "./endpoint.types";
import {
  EndpointValidationGroup,
  EndpointValidator,
} from "./endpoint.validator";
import { ResponseBodyTypeModifiedEvent } from "./events/response-body-type-modified.event";
import { StatusCodeModifiedEvent } from "./events/status-code-modified.event";

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
  private _endpoint_id: Uuid;
  private _method: HttpMethod;
  private _title: string;
  private _description: string;
  private _delay: number;
  private _statusCode: number;
  private _responseBodyType?: ResponseBodyType;
  private _responseJson?: string;
  private _responseText?: string;
  private _created_at: Date;

  constructor(props: ConstructorProps) {
    super();

    this.registerHandler(StatusCodeModifiedEvent.name, (event) =>
      this._onStatusCodeModified(event as StatusCodeModifiedEvent),
    );

    this.registerHandler(ResponseBodyTypeModifiedEvent.name, (event) =>
      this._onResponseBodyTypeModified(event as ResponseBodyTypeModifiedEvent),
    );

    this._endpoint_id = props.endpoint_id ?? new Uuid();
    this._method = props.method;
    this._title = props.title;
    this._description = props.description ?? "";
    this._delay = props.delay ?? 0;
    this._statusCode = props.statusCode;
    this._created_at = props.created_at ?? new Date();

    const allowBody = Endpoint.statusCodeAllowsBody(props.statusCode);

    if (allowBody) {
      this._responseBodyType = props.responseBodyType;

      if (props.responseBodyType === ResponseBodyType.JSON) {
        this._responseJson = props.responseJson ?? "{}";
      }

      if (props.responseBodyType === ResponseBodyType.TEXT) {
        this._responseText = props.responseText ?? "";
      }
    }
  }

  changeMethod(method: HttpMethod) {
    this._method = method;
    this.validate(["method"]);
  }

  changeTitle(title: string) {
    this._title = title;
    this.validate(["title"]);
  }

  changeDescription(description?: string) {
    this._description = description ?? "";
    this.validate(["description"]);
  }

  changeDelay(delay?: number) {
    this._delay = delay ?? 0;
    this.validate(["delay"]);
  }

  changeStatusCode(statusCode: number) {
    this._statusCode = statusCode;

    this.validate(["statusCode"]);

    this.applyEvent(new StatusCodeModifiedEvent());
  }

  changeResponseBodyType(responseBodyType: ResponseBodyType) {
    const statusCodeAllowsBody = Endpoint.statusCodeAllowsBody(
      this._statusCode,
    );

    if (!statusCodeAllowsBody) {
      throw new Error(
        "Status code does not allow body, cannot set response body type",
      );
    }

    this._responseBodyType = responseBodyType;

    this.validate(["responseBodyType"]);

    this.applyEvent(new ResponseBodyTypeModifiedEvent());
  }

  changeResponseJson(responseJson?: string) {
    if (this._responseBodyType !== ResponseBodyType.JSON) {
      throw new Error("Response body type must be JSON to set responseJson");
    }

    this._responseJson = responseJson ?? "{}";

    this.validate(["responseJson"]);
  }

  changeResponseText(responseText?: string) {
    if (this._responseBodyType !== ResponseBodyType.TEXT) {
      throw new Error("Response body type must be TEXT to set responseText");
    }

    this._responseText = responseText ?? "";
    this.validate(["responseText"]);
  }

  private _onStatusCodeModified(_event: StatusCodeModifiedEvent) {
    const hadBody = !!this._responseBodyType;
    const allowBody = Endpoint.statusCodeAllowsBody(this._statusCode);

    if (hadBody && !allowBody) {
      this._responseBodyType = undefined;
      this._responseJson = undefined;
      this._responseText = undefined;

      this.validate(["responseBodyType", "responseJson", "responseText"]);
      return;
    }

    if (!hadBody && allowBody) {
      this._responseBodyType = ResponseBodyType.EMPTY;
      this.validate(["responseBodyType"]);
      return;
    }
  }

  private _onResponseBodyTypeModified(_event: ResponseBodyTypeModifiedEvent) {
    switch (this._responseBodyType) {
      case ResponseBodyType.JSON:
        this._responseText = undefined;
        this._responseJson = this._responseJson ?? "{}";
        break;

      case ResponseBodyType.TEXT:
        this._responseJson = undefined;
        this._responseText = this._responseText ?? "";
        break;

      case ResponseBodyType.NULL:
        this._responseJson = undefined;
        this._responseText = undefined;
        break;
      case ResponseBodyType.EMPTY:
        this._responseJson = undefined;
        this._responseText = undefined;
        break;
    }

    this.validate(["responseJson", "responseText"]);
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
    return this._endpoint_id;
  }

  get method() {
    return this._method;
  }

  get title() {
    return this._title;
  }

  get description() {
    return this._description;
  }

  get delay() {
    return this._delay;
  }

  get statusCode() {
    return this._statusCode;
  }

  get responseBodyType() {
    return this._responseBodyType;
  }

  get responseJson() {
    return this._responseJson;
  }

  get responseText() {
    return this._responseText;
  }

  get created_at() {
    return this._created_at;
  }

  toJSON() {
    return {
      endpoint_id: this._endpoint_id.id,
      title: this._title,
      method: this._method,
      description: this._description,
      statusCode: this._statusCode,
      delay: this._delay,

      ...(this._responseBodyType && {
        responseBodyType: this._responseBodyType,
      }),
      ...(this._responseJson && { responseJson: this._responseJson }),
      ...(this._responseText && { responseText: this._responseText }),

      created_at: this._created_at,
    };
  }
}

type CreateCommandProps = {
  method: HttpMethod;
  title: string;
  description?: string;
  delay?: number;
  statusCode: number;
  responseBodyType?: ResponseBodyType;
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
