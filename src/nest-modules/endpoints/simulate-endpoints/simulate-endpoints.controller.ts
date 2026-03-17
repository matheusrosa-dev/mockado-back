import { Controller, Get } from "@nestjs/common";
import { Public } from "../../shared/decorators/public.decorator";

@Controller("endpoints/simulate")
export class SimulateEndpointsController {
  @Public()
  @Get(":endpointId")
  // TODO: adicionar validação por secret key
  async simulateGetEndpoint() {
    return {
      teste: "Simulate GET Endpoint",
    };
  }
}
