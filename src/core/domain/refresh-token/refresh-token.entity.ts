import { Entity } from "@domain/shared/entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import {
  RefreshTokenValidationGroup,
  RefreshTokenValidator,
} from "./refresh-token.validator";
import { RefreshTokenFakeBuilder } from "./refresh-token.fake-builder";

type ConstructorProps = {
  refreshTokenId?: Uuid;
  userId: Uuid;
  refreshTokenHash: string;
  createdAt?: Date;
};

export class RefreshToken extends Entity {
  private _refreshTokenId: Uuid;
  private _userId: Uuid;
  private _refreshTokenHash: string;
  private _createdAt: Date;

  constructor(props: ConstructorProps) {
    super();

    this._refreshTokenId = props.refreshTokenId ?? new Uuid();
    this._userId = props.userId;
    this._refreshTokenHash = props.refreshTokenHash;
    this._createdAt = props.createdAt ?? new Date();
  }

  validate(fields?: RefreshTokenValidationGroup[]) {
    const validator = new RefreshTokenValidator();

    return validator.validate(this.notification, this, fields);
  }

  get entityId() {
    return this._refreshTokenId;
  }

  get refreshTokenId() {
    return this._refreshTokenId;
  }

  get userId() {
    return this._userId;
  }

  get refreshTokenHash() {
    return this._refreshTokenHash;
  }

  get createdAt() {
    return this._createdAt;
  }

  toJSON() {
    return {
      refreshTokenId: this._refreshTokenId.toString(),
      userId: this._userId.toString(),
      refreshTokenHash: this._refreshTokenHash,
      createdAt: this._createdAt,
    };
  }
}

type CreateCommandProps = {
  userId: Uuid;
  refreshTokenHash: string;
};

export class RefreshTokenFactory {
  static async create(props: CreateCommandProps) {
    const refreshToken = new RefreshToken(props);

    refreshToken.validate();

    return refreshToken;
  }

  static fake() {
    return RefreshTokenFakeBuilder;
  }
}
