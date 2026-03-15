import { ListStatusCodesUseCase } from "@app/status-code/use-cases/list-status-codes/list-status-code.use-case";
import { Controller, Get } from "@nestjs/common";

@Controller("status-codes")
export class StatusCodesController {
  constructor(private listStatusCodesUseCase: ListStatusCodesUseCase) {}

  @Get()
  async listStatusCodes() {
    return this.listStatusCodesUseCase.execute();
  }
}
