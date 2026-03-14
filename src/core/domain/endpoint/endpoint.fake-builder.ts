import { Chance } from "chance";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { Endpoint } from "./endpoint.entity";
import { HttpMethod, ResponseBodyType } from "./endpoint.types";
import { StatusCode } from "./value-objects/status-code.vo";

type PropOrFactory<T> = T | (() => T);

export class EndpointFakeBuilder<TBuild = Endpoint | Endpoint[]> {
  private readonly chance = Chance();

  private _endpointId?: PropOrFactory<Uuid>;
  private _userId: PropOrFactory<Uuid> = () => new Uuid();
  private _method: PropOrFactory<HttpMethod> = () =>
    this.chance.pickone(Object.values(HttpMethod));
  private _title: PropOrFactory<string> = () => this.chance.word();
  private _description: PropOrFactory<string | undefined> = () =>
    this.chance.paragraph({ sentences: 1 });
  private _delay: PropOrFactory<number | undefined> = () =>
    this.chance.integer({ min: 0, max: 10 });
  private _statusCode: PropOrFactory<StatusCode> = () =>
    new StatusCode(
      this.chance.pickone([200, 201, 204, 400, 401, 403, 404, 500, 502, 503]),
    );
  private _responseBodyType: PropOrFactory<ResponseBodyType> = () =>
    this.chance.pickone(Object.values(ResponseBodyType));
  private _responseJson: PropOrFactory<string> = () =>
    JSON.stringify({ message: this.chance.sentence() });
  private _responseText: PropOrFactory<string> = () => this.chance.sentence();
  private _createdAt?: PropOrFactory<Date>;

  private constructor(private readonly amount = 1) {}

  static oneEndpoint() {
    return new EndpointFakeBuilder<Endpoint>();
  }

  static manyEndpoints(amount: number) {
    return new EndpointFakeBuilder<Endpoint[]>(amount);
  }

  withEndpointId(valueOrFactory: PropOrFactory<Uuid>) {
    this._endpointId = valueOrFactory;
    return this;
  }

  withUserId(valueOrFactory: PropOrFactory<Uuid>) {
    this._userId = valueOrFactory;
    return this;
  }

  withMethod(valueOrFactory: PropOrFactory<HttpMethod>) {
    this._method = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
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

  withStatusCode(valueOrFactory: PropOrFactory<StatusCode>) {
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
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const endpoints = Array.from({ length: this.amount }, () => {
      const endpoint = new Endpoint({
        ...(this._endpointId && {
          endpointId: this.callFactory(this._endpointId),
        }),

        userId: this.callFactory(this._userId),
        method: this.callFactory(this._method),
        title: this.callFactory(this._title),
        description: this.callFactory(this._description),
        delay: this.callFactory(this._delay),
        statusCode: this.callFactory(this._statusCode),
        responseBodyType: this.callFactory(this._responseBodyType),
        responseJson: this.callFactory(this._responseJson),
        responseText: this.callFactory(this._responseText),

        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt),
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
