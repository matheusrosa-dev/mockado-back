import { Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { ME_PROVIDERS } from "./me.provider";

@Module({
  controllers: [MeController],
  providers: [
    ...Object.values(ME_PROVIDERS.REPOSITORIES),
    ...Object.values(ME_PROVIDERS.SERVICES),
    ...Object.values(ME_PROVIDERS.USE_CASES),
  ],
})
export class MeModule {}
