import { ListStatusCodesUseCase } from "../list-status-code.use-case";

describe("List Status Codes UseCase - Unit Tests", () => {
  let useCase: ListStatusCodesUseCase;

  beforeEach(() => {
    useCase = new ListStatusCodesUseCase();
  });

  it("should return a list of status codes", async () => {
    const result = await useCase.execute();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(63);

    result.forEach((statusCode) => {
      expect(typeof statusCode.code).toBe("number");
      expect(typeof statusCode.description).toBe("string");
    });
  });
});
