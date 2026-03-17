import { Module } from "@nestjs/common";
import { EndpointsController } from "./endpoints.controller";
import { ENDPOINT_PROVIDERS } from "./endpoints.provider";
import { SimulateEndpointsModule } from "./simulate-endpoints/endpoints.module";

@Module({
  imports: [SimulateEndpointsModule],
  controllers: [EndpointsController],
  providers: [
    ...Object.values(ENDPOINT_PROVIDERS.REPOSITORIES),
    ...Object.values(ENDPOINT_PROVIDERS.USE_CASES),
  ],
})
export class EndpointsModule {}
