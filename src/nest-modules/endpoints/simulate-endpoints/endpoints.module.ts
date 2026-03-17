import { Module } from "@nestjs/common";
import { SimulateEndpointsController } from "./simulate-endpoints.controller";

@Module({
  controllers: [SimulateEndpointsController],
})
export class SimulateEndpointsModule {}
