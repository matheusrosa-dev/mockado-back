import { Module } from "@nestjs/common";
import { StatusCodesController } from "./status-codes.controller";
import { ListStatusCodesUseCase } from "@app/status-code/use-cases/list-status-codes/list-status-code.use-case";

@Module({
  controllers: [StatusCodesController],
  providers: [
    {
      provide: ListStatusCodesUseCase,
      useFactory: () => new ListStatusCodesUseCase(),
    },
  ],
})
export class StatusCodesModule {}
