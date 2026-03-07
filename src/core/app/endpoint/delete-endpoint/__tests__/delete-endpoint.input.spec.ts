/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { DeleteEndpointInput } from "../delete-endpoint.input";
import { Uuid } from "../../../../domain/shared/value-objects/uuid.vo";

function validate(props: object) {
  const input = new DeleteEndpointInput(props as any);
  return validateSync(input);
}

describe("Delete Endpoint Input - Unit Tests", () => {
  it("should pass with valid id", () => {
    const errors = validate({
      id: new Uuid().id,
    });
    expect(errors).toHaveLength(0);
  });

  it("should fail when id is empty", () => {
    const errors = validate({ id: "" });
    const fields = errors.map((e) => e.property);
    expect(fields).toContain("id");
  });

  it("should fail when id is invalid", () => {
    const errors = validate({ id: "invalid-id" });
    const fields = errors.map((e) => e.property);
    expect(fields).toContain("id");
  });
});
