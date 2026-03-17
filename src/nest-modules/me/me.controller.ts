import { GenerateApiKeyUseCase } from "@app/me/use-cases/generate-api-key/generate-api-key.use-case";
import { Controller, Get } from "@nestjs/common";
import {
  CurrentSession,
  type ICurrentSession,
} from "../shared/decorators/current-session.decorator";

@Controller("me")
export class MeController {
  constructor(private generateApiKeyUseCase: GenerateApiKeyUseCase) {}

  @Get("api-key")
  generateApiKey(@CurrentSession() session: ICurrentSession) {
    return this.generateApiKeyUseCase.execute({
      userId: session.userId,
    });
  }
}
