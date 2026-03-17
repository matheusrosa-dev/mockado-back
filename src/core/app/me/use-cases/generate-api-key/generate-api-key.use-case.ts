import { IApiKeyService } from "@app/me/services/api-key.service";
import { IUseCase } from "@app/shared/use-case.interface";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { User } from "@domain/user/user.entity";
import { IUserRepository } from "@domain/user/user.repository";

export class GenerateApiKeyUseCase
  implements IUseCase<GenerateApiKeyInput, GenerateApiKeyOutput>
{
  constructor(
    private userRepository: IUserRepository,
    private apiKeyService: IApiKeyService,
  ) {}

  async execute(input: GenerateApiKeyInput): Promise<GenerateApiKeyOutput> {
    const user = await this.userRepository.findById(new Uuid(input.userId));

    if (!user) {
      throw new NotFoundError(input.userId, User);
    }

    const { apiKey, apiKeyHash } = this.apiKeyService.generate();

    user.changeApiKeyHash(apiKeyHash);

    await this.userRepository.update(user);

    return { apiKey };
  }
}

type GenerateApiKeyInput = {
  userId: string;
};

type GenerateApiKeyOutput = {
  apiKey: string;
};
