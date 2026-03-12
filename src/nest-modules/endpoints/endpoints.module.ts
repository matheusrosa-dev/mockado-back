import { Module } from "@nestjs/common";
import { EndpointsController } from "./endpoints.controller";
import { ENDPOINT_PROVIDERS } from "./endpoints.provider";

@Module({
  controllers: [EndpointsController],
  providers: [
    ENDPOINT_PROVIDERS.REPOSITORY,
    ...Object.values(ENDPOINT_PROVIDERS.USE_CASES),
  ],
})
export class EndpointsModule {}
