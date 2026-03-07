import { EndpointInMemoryRepository } from "../../../../infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "../../../../domain/endpoint/endpoint.repository";
import { DeleteEndpointUseCase } from "../delete-endpoint.use-case";
import { EndpointFactory } from "../../../../domain/endpoint/endpoint.entity";
import { Uuid } from "../../../../domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "../../../../domain/shared/errors/not-found.error";

describe("Delete Endpoint Use Case - Unit Tests", () => {
  let useCase: DeleteEndpointUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
    useCase = new DeleteEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should delete an endpoint", async () => {
      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;

      inMemoryRepository.items = [endpoint];

      expect(inMemoryRepository.items.length).toBe(1);

      await useCase.execute({
        id: endpoint.entity_id.id,
      });

      expect(inMemoryRepository.items.length).toBe(0);
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
