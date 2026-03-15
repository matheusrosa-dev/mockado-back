/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { ListEndpointsSummaryInput } from "../list-endpoints-summary.input";

function validate(props: object) {
  const input = new ListEndpointsSummaryInput(props as any);
  return validateSync(input);
}

describe("List Endpoints Summary Input - Unit Tests", () => {
  it("should fail when googleId and userId are empty", () => {
    const errors = validate({});

    const googleIdError = errors.find(
      (error) => error.property === "googleId",
    )!;

    const userIdError = errors.find((error) => error.property === "userId")!;

    expect(errors).toHaveLength(2);
    expect(Object.keys(googleIdError.constraints as object)).toContain(
      "isNotEmpty",
    );
    expect(Object.keys(userIdError.constraints as object)).toContain(
      "isNotEmpty",
    );
  });

  it("should fail when userId is not a UUID", () => {
    const errors = validate({
      userId: "invalid-uuid",
    });

    const userIdError = errors.find((error) => error.property === "userId")!;

    expect(errors).toHaveLength(1);
    expect(Object.keys(userIdError.constraints as object)).toContain("isUuid");
  });

  it("should pass with valid props", () => {
    const errors1 = validate({
      userId: new Uuid().id,
    });
    expect(errors1).toHaveLength(0);

    const errors2 = validate({
      googleId: "valid-google-id",
    });

    expect(errors2).toHaveLength(0);
  });
});
