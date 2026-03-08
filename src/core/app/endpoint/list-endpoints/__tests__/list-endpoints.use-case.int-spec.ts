import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { ListEndpointsUseCase } from "../list-endpoints.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { EndpointTypeOrmRepository } from "@infra/endpoint/db/typeorm/endpoint-typeorm.repository";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("List Endpoints Use Case - Integration Tests", () => {
  let useCase: ListEndpointsUseCase;
  let repository: IEndpointRepository;

  const { dataSource } = setupTypeOrm({
    entities: [EndpointModel],
  });

  beforeEach(() => {
    repository = new EndpointTypeOrmRepository(dataSource);
    useCase = new ListEndpointsUseCase(repository);
  });

  describe("execute()", () => {
    it("should list all endpoints", async () => {
      const endpoints = [
        EndpointFactory.fake().oneEndpoint().withStatusCode(204).build(),
        EndpointFactory.fake().oneEndpoint().withStatusCode(204).build(),
      ];

      for (const endpoint of endpoints) {
        await repository.insert(endpoint);
      }

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
