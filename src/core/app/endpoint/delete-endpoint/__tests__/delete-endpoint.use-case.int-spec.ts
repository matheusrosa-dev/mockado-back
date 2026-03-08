import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { DeleteEndpointUseCase } from "../delete-endpoint.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";

describe("Delete Endpoint Use Case - Integration Tests", () => {
  let useCase: DeleteEndpointUseCase;
  let repository: IEndpointRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel],
  });

  beforeEach(() => {
    repository = new EndpointTypeOrmRepository(dataSource);
    useCase = new DeleteEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should delete an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      await repository.insert(endpoint);

      await useCase.execute({
        id: endpoint.entity_id.id,
      });

      const found = await repository.findById(endpoint.entity_id);

      expect(found).toBeNull();
    });

    it("should throw an error if endpoint not found", async () => {
      const id = new Uuid();

      await expect(
        useCase.execute({
          id: id.id,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
