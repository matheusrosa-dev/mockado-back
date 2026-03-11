/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { validateSync } from "class-validator";
import { DeleteEndpointInput } from "../delete-endpoint.input";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

function validate(props: object) {
  const input = new DeleteEndpointInput(props as any);
  return validateSync(input);
}

describe("Delete Endpoint Input - Unit Tests", () => {
  it("should pass with valid id", () => {
    const errors = validate({
      endpointId: new Uuid().id,
    });
    expect(errors).toHaveLength(0);
  });

  it("should fail when id is empty", () => {
    const errors = validate({ endpointId: "" });
    const fields = errors.map((error) => error.property);
    expect(fields).toContain("endpointId");
  });

  it("should fail when id is invalid", () => {
    const errors = validate({ endpointId: "invalid-id" });
    const fields = errors.map((error) => error.property);
    expect(fields).toContain("endpointId");
  });
});
