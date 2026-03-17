import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { GenerateApiKeyUseCase } from "../generate-api-key.use-case";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { IUserRepository } from "@domain/user/user.repository";
import { UserFactory } from "@domain/user/user.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { CryptoApiKeyService } from "@infra/me/services/crypto-api-key.service";

describe("Generate Api Key Use Case - Integration Tests", () => {
  let useCase: GenerateApiKeyUseCase;
  let userRepository: IUserRepository;

  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  const apiKeyService = new CryptoApiKeyService();

  beforeEach(() => {
    userRepository = new UserTypeOrmRepository(dataSource);
    useCase = new GenerateApiKeyUseCase(userRepository, apiKeyService);
  });

  describe("execute()", () => {
    it("should generate a new API key for the user", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      const result = await useCase.execute({ userId: user.userId.toString() });

      expect(result).toHaveProperty("apiKey");
      expect(typeof result.apiKey).toBe("string");

      const updatedUser = await userRepository.findById(user.userId);

      expect(updatedUser?.apiKeyHash).not.toBeNull();
    });

    it("should replace the old API key hash if the user already has one", async () => {
      const user = UserFactory.fake().oneUser().build();

      await userRepository.insert(user);

      await useCase.execute({
        userId: user.userId.toString(),
      });

      const firstApiKeyHash = (await userRepository.findById(user.userId))
        ?.apiKeyHash;

      await useCase.execute({
        userId: user.userId.toString(),
      });

      const secondApiKeyHash = (await userRepository.findById(user.userId))
        ?.apiKeyHash;

      expect(firstApiKeyHash).not.toBeNull();
      expect(secondApiKeyHash).not.toBeNull();
      expect(firstApiKeyHash).not.toBe(secondApiKeyHash);
    });

    it("should throw NotFoundError if user does not exist", async () => {
      await expect(
        useCase.execute({ userId: new Uuid().toString() }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
