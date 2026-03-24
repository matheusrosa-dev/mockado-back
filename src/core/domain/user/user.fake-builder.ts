import { Chance } from "chance";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { User } from "./user.entity";

type PropOrFactory<T> = T | (() => T);

export class UserFakeBuilder<TBuild = User | User[]> {
  private readonly chance = Chance();

  private _userId?: PropOrFactory<Uuid>;
  private _googleId: PropOrFactory<string> = () =>
    this.chance.string({ length: 21, pool: "0123456789" });
  private _email: PropOrFactory<string> = () => this.chance.email();
  private _name: PropOrFactory<string> = () => this.chance.name();
  private _isActive: PropOrFactory<boolean> = () => this.chance.bool();
  private _createdAt?: PropOrFactory<Date>;

  private constructor(private readonly amount = 1) {}

  static oneUser() {
    return new UserFakeBuilder<User>();
  }

  static manyUsers(amount: number) {
    return new UserFakeBuilder<User[]>(amount);
  }

  withUserId(valueOrFactory: PropOrFactory<Uuid>) {
    this._userId = valueOrFactory;
    return this;
  }

  withGoogleId(valueOrFactory: PropOrFactory<string>) {
    this._googleId = valueOrFactory;
    return this;
  }

  withEmail(valueOrFactory: PropOrFactory<string>) {
    this._email = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  withIsActive(valueOrFactory: PropOrFactory<boolean>) {
    this._isActive = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const users = Array.from({ length: this.amount }, () => {
      const user = new User({
        ...(this._userId && { userId: this.callFactory(this._userId) }),

        googleId: this.callFactory(this._googleId),
        email: this.callFactory(this._email),
        name: this.callFactory(this._name),

        isActive:
          this._isActive === undefined
            ? undefined
            : this.callFactory(this._isActive),

        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt),
        }),
      });

      user.validate();

      return user;
    });

    if (this.amount === 1) {
      const [user] = users;
      return user as TBuild;
    }

    return users as TBuild;
  }

  private callFactory<T>(factoryOrValue: PropOrFactory<T>): T {
    if (typeof factoryOrValue === "function") {
      return (factoryOrValue as () => T)();
    }

    return factoryOrValue;
  }
}
