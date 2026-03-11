import { Chance } from "chance";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { RefreshToken } from "./refresh-token.entity";

type PropOrFactory<T> = T | (() => T);

export class RefreshTokenFakeBuilder<TBuild = RefreshToken | RefreshToken[]> {
  private readonly chance = Chance();

  private _refreshTokenId?: PropOrFactory<Uuid>;
  private _userId: PropOrFactory<Uuid> = () => new Uuid();
  private _refreshTokenHash: PropOrFactory<string> = () =>
    this.chance.string({ length: 60 });
  private _createdAt?: PropOrFactory<Date>;

  private constructor(private readonly amount = 1) {}

  static oneRefreshToken() {
    return new RefreshTokenFakeBuilder<RefreshToken>();
  }

  static manyRefreshTokens(amount: number) {
    return new RefreshTokenFakeBuilder<RefreshToken[]>(amount);
  }

  withRefreshTokenId(valueOrFactory: PropOrFactory<Uuid>) {
    this._refreshTokenId = valueOrFactory;
    return this;
  }

  withUserId(valueOrFactory: PropOrFactory<Uuid>) {
    this._userId = valueOrFactory;
    return this;
  }

  withRefreshTokenHash(valueOrFactory: PropOrFactory<string>) {
    this._refreshTokenHash = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const refreshTokens = Array.from({ length: this.amount }, () => {
      const refreshToken = new RefreshToken({
        ...(this._refreshTokenId && {
          refreshTokenId: this.callFactory(this._refreshTokenId),
        }),

        userId: this.callFactory(this._userId),
        refreshTokenHash: this.callFactory(this._refreshTokenHash),

        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt),
        }),
      });

      refreshToken.validate();

      return refreshToken;
    });

    if (this.amount === 1) {
      const [refreshToken] = refreshTokens;
      return refreshToken as TBuild;
    }

    return refreshTokens as TBuild;
  }

  private callFactory<T>(factoryOrValue: PropOrFactory<T>): T {
    if (typeof factoryOrValue === "function") {
      return (factoryOrValue as () => T)();
    }

    return factoryOrValue;
  }
}
