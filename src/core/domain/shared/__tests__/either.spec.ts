/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { Either } from "../either";

describe("Either - Unit Tests", () => {
  describe("Either.ok", () => {
    it("should create an ok instance", () => {
      const result = Either.ok("value");
      expect(result.ok).toBe("value");
      expect(result.error).toBeNull();
    });

    it("isOk() should return true", () => {
      const result = Either.ok("value");
      expect(result.isOk()).toBe(true);
    });

    it("isFail() should return false", () => {
      const result = Either.ok("value");
      expect(result.isFail()).toBe(false);
    });
  });

  describe("Either.fail", () => {
    it("should create a fail instance", () => {
      const error = new Error("something went wrong");
      const result = Either.fail(error);
      expect(result.error).toBe(error);
      expect(result.ok).toBeNull();
    });

    it("isFail() should return true", () => {
      const result = Either.fail(new Error("err"));
      expect(result.isFail()).toBe(true);
    });

    it("isOk() should return false", () => {
      const result = Either.fail(new Error("err"));
      expect(result.isOk()).toBe(false);
    });
  });

  describe("Either.of", () => {
    it("should create an ok instance", () => {
      const result = Either.of(42);
      expect(result.ok).toBe(42);
      expect(result.isOk()).toBe(true);
    });
  });

  describe("Either.safe", () => {
    it("should return ok when function succeeds", () => {
      const result = Either.safe(() => "success");
      expect(result.isOk()).toBe(true);
      expect(result.ok).toBe("success");
    });

    it("should return fail when function throws", () => {
      const error = new Error("boom");
      const result = Either.safe(() => {
        throw error;
      });
      expect(result.isFail()).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("map", () => {
    it("should transform the ok value", () => {
      const result = Either.ok(2).map((v) => v * 3);
      expect(result.ok).toBe(6);
      expect(result.isOk()).toBe(true);
    });

    it("should not call fn and propagate error when fail", () => {
      const error = new Error("err");
      const fn = jest.fn();
      const result = Either.fail<Error, number>(error).map(fn);
      expect(fn).not.toHaveBeenCalled();
      expect(result.isFail()).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("chain", () => {
    it("should return result of fn when ok", () => {
      const result = Either.ok(5).chain((v) => Either.ok(v + 1));
      expect(result.ok).toBe(6);
      expect(result.isOk()).toBe(true);
    });

    it("should return fail from fn when fn returns fail", () => {
      const innerError = new Error("inner");
      const result = Either.ok(5).chain(() => Either.fail(innerError));
      expect(result.isFail()).toBe(true);
      expect(result.error).toBe(innerError);
    });

    it("should not call fn and propagate error when fail", () => {
      const error = new Error("outer");
      const fn = jest.fn();
      const result = Either.fail<Error, number>(error).chain(fn);
      expect(fn).not.toHaveBeenCalled();
      expect(result.isFail()).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("chainEach", () => {
    it("should map each item and return ok array when all succeed", () => {
      const result = Either.ok([1, 2, 3]).chainEach((v) => Either.ok(v * 2));
      expect(result.isOk()).toBe(true);
      expect(result.ok).toEqual([2, 4, 6]);
    });

    it("should return fail with array of errors when any item fails", () => {
      const err1 = new Error("err1");
      const err2 = new Error("err2");
      const result = Either.ok([1, 2, 3]).chainEach((v) => {
        if (v > 1) return Either.fail(v === 2 ? err1 : err2);
        return Either.ok(v);
      });
      expect(result.isFail()).toBe(true);
      expect(result.error).toEqual([err1, err2]);
    });

    it("should throw when value is not an array", () => {
      expect(() =>
        Either.ok("not-an-array" as any).chainEach((v) => Either.ok(v)),
      ).toThrow("Method chainEach only works with arrays");
    });

    it("should propagate error when called on fail", () => {
      const error = new Error("fail");
      const fn = jest.fn();
      const result = Either.fail<Error, number[]>(error).chainEach(fn);
      expect(fn).not.toHaveBeenCalled();
      expect(result.isFail()).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("asArray", () => {
    it("should return [ok, null] for ok instance", () => {
      const result = Either.ok("data");
      expect(result.asArray()).toEqual(["data", null]);
    });

    it("should return [null, error] for fail instance", () => {
      const error = new Error("oops");
      const result = Either.fail(error);
      expect(result.asArray()).toEqual([null, error]);
    });
  });

  describe("iterator", () => {
    it("should iterate ok first then error via destructuring", () => {
      const result = Either.ok("hello");
      const [ok, error] = result;
      expect(ok).toBe("hello");
      expect(error).toBeNull();
    });

    it("should iterate null ok then error for fail instance", () => {
      const error = new Error("fail");
      const result = Either.fail(error);
      const [ok, err] = result;
      expect(ok).toBeNull();
      expect(err).toBe(error);
    });

    it("should return done after two iterations", () => {
      const iter = Either.ok("x")[Symbol.iterator]();
      iter.next(); // ok
      iter.next(); // error
      const done = iter.next();
      expect(done.done).toBe(true);
      expect(done.value).toBeNull();
    });
  });
});
