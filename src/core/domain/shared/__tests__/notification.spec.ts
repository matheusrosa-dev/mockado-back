import { Notification } from "../notification";

describe("Notification - Unit Tests", () => {
  let notification: Notification;

  beforeEach(() => {
    notification = new Notification();
  });

  describe("initial state", () => {
    it("should start with empty errors map", () => {
      expect(notification.errors.size).toBe(0);
    });

    it("hasErrors() should return false when no errors", () => {
      expect(notification.hasErrors()).toBe(false);
    });
  });

  describe("addError()", () => {
    it("should add a global error (no field) using the error string as key", () => {
      notification.addError("some error");
      expect(notification.errors.get("some error")).toBe("some error");
    });

    it("should add an error to a specific field", () => {
      notification.addError("required", "name");
      expect(notification.errors.get("name")).toEqual(["required"]);
    });

    it("should accumulate multiple errors for the same field", () => {
      notification.addError("required", "name");
      notification.addError("too short", "name");
      expect(notification.errors.get("name")).toEqual([
        "required",
        "too short",
      ]);
    });

    it("should not duplicate the same error for the same field", () => {
      notification.addError("required", "name");
      notification.addError("required", "name");
      expect(notification.errors.get("name")).toEqual(["required"]);
    });

    it("hasErrors() should return true after adding an error", () => {
      notification.addError("some error");
      expect(notification.hasErrors()).toBe(true);
    });
  });

  describe("setError()", () => {
    it("should set a single string error for a field (overwrites)", () => {
      notification.setError("required", "email");
      expect(notification.errors.get("email")).toEqual(["required"]);
    });

    it("should set an array of errors for a field", () => {
      notification.setError(["required", "invalid format"], "email");
      expect(notification.errors.get("email")).toEqual([
        "required",
        "invalid format",
      ]);
    });

    it("should overwrite existing field errors", () => {
      notification.addError("too short", "name");
      notification.setError("required", "name");
      expect(notification.errors.get("name")).toEqual(["required"]);
    });

    it("should set a global error (no field) using the string as key", () => {
      notification.setError("global error");
      expect(notification.errors.get("global error")).toBe("global error");
    });

    it("should set multiple global errors from an array (no field)", () => {
      notification.setError(["error one", "error two"]);
      expect(notification.errors.get("error one")).toBe("error one");
      expect(notification.errors.get("error two")).toBe("error two");
    });

    it("hasErrors() should return true after setError", () => {
      notification.setError("something", "field");
      expect(notification.hasErrors()).toBe(true);
    });
  });

  describe("toJSON()", () => {
    it("should return empty array when no errors", () => {
      expect(notification.toJSON()).toEqual([]);
    });

    it("should return global errors as plain strings", () => {
      notification.addError("global error");
      expect(notification.toJSON()).toEqual(["global error"]);
    });

    it("should return field errors as objects", () => {
      notification.addError("required", "name");
      expect(notification.toJSON()).toEqual([{ name: ["required"] }]);
    });

    it("should return mixed global and field errors", () => {
      notification.addError("global error");
      notification.addError("required", "email");
      const json = notification.toJSON();
      expect(json).toContain("global error");
      expect(json).toContainEqual({ email: ["required"] });
    });

    it("should reflect multiple errors per field in toJSON", () => {
      notification.addError("required", "age");
      notification.addError("must be positive", "age");
      expect(notification.toJSON()).toEqual([
        { age: ["required", "must be positive"] },
      ]);
    });

    it("should reflect multiple global errors from setError array", () => {
      notification.setError(["err1", "err2"]);
      const json = notification.toJSON();
      expect(json).toContain("err1");
      expect(json).toContain("err2");
    });
  });
});
