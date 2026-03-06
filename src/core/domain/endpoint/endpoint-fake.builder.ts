import { Chance } from "chance";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { Endpoint } from "./endpoint.entity";
import { HttpMethod, ResponseBodyType } from "./endpoint.types";

type PropOrFactory<T> = T | (() => T);

export class EndpointFakeBuilder<TBuild = Endpoint | Endpoint[]> {
  private _endpoint_id?: PropOrFactory<Uuid>;
  private _method: PropOrFactory<HttpMethod> = () =>
    this.chance.pickone([
      HttpMethod.GET,
      HttpMethod.POST,
      HttpMethod.PUT,
      HttpMethod.DELETE,
      HttpMethod.PATCH,
    ]) as HttpMethod;
  private _title: PropOrFactory<string> = () => this.chance.word();
  private _description: PropOrFactory<string | undefined> = () =>
    this.chance.paragraph({
      sentences: 1,
    });
  private _delay: PropOrFactory<number | undefined> = () =>
    this.chance.integer({ min: 0, max: 10 });
  private _statusCode: PropOrFactory<number> = () =>
    this.chance.pickone([
      200, 201, 204, 400, 401, 403, 404, 500, 502, 503,
    ]) as number;
  private _responseBodyType: PropOrFactory<ResponseBodyType> = () =>
    this.chance.pickone([
      ResponseBodyType.JSON,
      ResponseBodyType.TEXT,
      ResponseBodyType.NULL,
      ResponseBodyType.EMPTY,
    ]) as ResponseBodyType;
  private _responseJson: PropOrFactory<string> = () =>
    JSON.stringify({ message: this.chance.sentence() });
  private _responseText: PropOrFactory<string> = () => this.chance.sentence();
  private _created_at?: PropOrFactory<Date>;

  private amount: number;
  private chance: Chance.Chance;

  static oneEndpoint() {
    return new EndpointFakeBuilder<Endpoint>();
  }

  static manyEndpoints(amount: number) {
    return new EndpointFakeBuilder<Endpoint[]>(amount);
  }

  private constructor(amount = 1) {
    this.amount = amount;
    this.chance = Chance();
  }

  withEndpointId(valueOrFactory: PropOrFactory<Uuid>) {
    this._endpoint_id = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
    return this;
  }

  withMethod(valueOrFactory: PropOrFactory<HttpMethod>) {
    this._method = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string | undefined>) {
    this._description = valueOrFactory;
    return this;
  }

  withDelay(valueOrFactory: PropOrFactory<number | undefined>) {
    this._delay = valueOrFactory;
    return this;
  }

  withStatusCode(valueOrFactory: PropOrFactory<number>) {
    this._statusCode = valueOrFactory;
    return this;
  }

  withResponseBodyType(valueOrFactory: PropOrFactory<ResponseBodyType>) {
    this._responseBodyType = valueOrFactory;
    return this;
  }

  withResponseJson(valueOrFactory: PropOrFactory<string>) {
    this._responseJson = valueOrFactory;
    return this;
  }

  withResponseText(valueOrFactory: PropOrFactory<string>) {
    this._responseText = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const endpoints = new Array(this.amount).fill(undefined).map(() => {
      const endpoint = new Endpoint({
        ...(this._endpoint_id && {
          endpoint_id: this.callFactory(this._endpoint_id),
        }),

        method: this.callFactory(this._method),
        title: this.callFactory(this._title),
        statusCode: this.callFactory(this._statusCode),
        responseBodyType: this.callFactory(this._responseBodyType),
        responseJson: this.callFactory(this._responseJson),
        responseText: this.callFactory(this._responseText),
        delay: this.callFactory(this._delay),
        description: this.callFactory(this._description),

        ...(this._created_at && {
          created_at: this.callFactory(this._created_at),
        }),
      });

      endpoint.validate();

      return endpoint;
    });

    if (this.amount === 1) {
      const [endpoint] = endpoints;
      return endpoint as TBuild;
    }

    return endpoints as TBuild;
  }

  private callFactory<T>(factoryOrValue: PropOrFactory<T>): T {
    if (typeof factoryOrValue === "function") {
      return (factoryOrValue as () => T)();
    }

    return factoryOrValue;
  }
}
