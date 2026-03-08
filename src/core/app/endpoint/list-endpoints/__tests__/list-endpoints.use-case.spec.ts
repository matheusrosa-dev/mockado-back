import { EndpointInMemoryRepository } from "@infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { ListEndpointsUseCase } from "../list-endpoints.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";

describe("List Endpoints Use Case - Unit Tests", () => {
  let useCase: ListEndpointsUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
    useCase = new ListEndpointsUseCase(repository);
  });

  describe("execute()", () => {
    it("should list all endpoints", async () => {
      const endpoints = [
        EndpointFactory.fake().oneEndpoint().withStatusCode(204).build(),
        EndpointFactory.fake().oneEndpoint().withStatusCode(204).build(),
      ];

      const inMemoryRepository = repository as EndpointInMemoryRepository;

      inMemoryRepository.items = endpoints;

      const endpointsList = await useCase.execute();

      expect(endpointsList).toEqual(
        endpoints.map((endpoint) => ({
          id: endpoint.entity_id.id,
          title: endpoint.title,
          method: endpoint.method,
          description: endpoint.description,
          statusCode: endpoint.statusCode,
          delay: endpoint.delay,
          createdAt: endpoint.createdAt,
        })),
      );
    });

    it("should return an empty array if no endpoints found", async () => {
      const endpointsList = await useCase.execute();
      expect(endpointsList).toEqual([]);
    });
  });
});
