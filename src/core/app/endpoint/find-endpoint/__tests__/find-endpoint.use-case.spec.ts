import { EndpointInMemoryRepository } from "@infra/endpoint/db/in-memory/endpoint-in-memory.repository";
import { IEndpointRepository } from "@domain/endpoint/endpoint.repository";
import { FindEndpointUseCase } from "../find-endpoint.use-case";
import { EndpointFactory } from "@domain/endpoint/endpoint.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { EndpointOutputMapper } from "@app/endpoint/common/endpoint.output";
import { StatusCode } from "@domain/endpoint/value-objects/status-code.vo";

describe("Find Endpoint Use Case - Unit Tests", () => {
  let useCase: FindEndpointUseCase;
  let repository: IEndpointRepository;

  beforeEach(() => {
    repository = new EndpointInMemoryRepository();
    useCase = new FindEndpointUseCase(repository);
  });

  describe("execute()", () => {
    it("should find an endpoint", async () => {
      const endpoint = EndpointFactory.fake()
        .oneEndpoint()
        .withStatusCode(new StatusCode(204))
        .build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;

      inMemoryRepository.items = [endpoint];

      const foundEndpoint = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
      });

      expect(foundEndpoint).toEqual({
        id: endpoint.endpointId.toString(),
        title: endpoint.title,
        method: endpoint.method,
        statusCode: endpoint.statusCode.statusCode,
        description: endpoint.description,
        delay: endpoint.delay,
        createdAt: endpoint.createdAt,
      });
    });

    it("should throw an error if endpoint not found", async () => {
      const id = new Uuid();

      await expect(
        useCase.execute({
          endpointId: id.id,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should return formatted output", async () => {
      const outputSpy = jest.spyOn(EndpointOutputMapper, "toOutput");

      const endpoint = EndpointFactory.fake().oneEndpoint().build();

      const inMemoryRepository = repository as EndpointInMemoryRepository;

      inMemoryRepository.items = [endpoint];

      const output = await useCase.execute({
        endpointId: endpoint.endpointId.toString(),
      });

      expect(outputSpy).toHaveBeenCalledTimes(1);

      const outputMapped = EndpointOutputMapper.toOutput(endpoint);

      expect(output).toStrictEqual({
        ...outputMapped,
        id: output.id,
        createdAt: output.createdAt,
      });
    });
  });
});
