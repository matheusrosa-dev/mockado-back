import isEqual from "fast-deep-equal";

export abstract class ValueObject {
  public equals(valueObject: this): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false;
    }

    if (valueObject.constructor.name !== this.constructor.name) {
      return false;
    }

    return isEqual(valueObject, this);
  }
}
