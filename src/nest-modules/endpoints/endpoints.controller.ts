import { CreateEndpointUseCase } from "@app/endpoint/create-endpoint/create-endpoint.use-case";
import { UpdateEndpointUseCase } from "@app/endpoint/update-endpoint/update-endpoint.use-case";
import { FindEndpointUseCase } from "@app/endpoint/find-endpoint/find-endpoint.use-case";
import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateEndpointDto } from "./dtos/create-endpoint.dto";
import { FindEndpointByIdDto } from "./dtos/find-endpoint-by-id.dto";
import { ListEndpointsSummaryUseCase } from "@app/endpoint/list-endpoints-summary/list-endpoints-summary.use-case";
import {
  UpdateEndpointBodyDto,
  UpdateEndpointParamsDto,
} from "./dtos/update-endpoint.dto";
import {
  CurrentSession,
  type ICurrentSession,
} from "../shared/decorators/current-session.decorator";

@Controller("endpoints")
export class EndpointsController {
  constructor(
    private listEndpointsSummaryUseCase: ListEndpointsSummaryUseCase,
    private createEndpointUseCase: CreateEndpointUseCase,
    private updateEndpointUseCase: UpdateEndpointUseCase,
    private findEndpointUseCase: FindEndpointUseCase,
  ) {}

  @Post()
  async createEndpoint(
    @Body() createEndpointDto: CreateEndpointDto,
    @CurrentSession() session: ICurrentSession,
  ) {
    return this.createEndpointUseCase.execute({
      ...createEndpointDto,
      googleId: session.googleId,
    });
  }

  @Get("summary")
  async listEndpointsSummary(@CurrentSession() session: ICurrentSession) {
    return this.listEndpointsSummaryUseCase.execute({
      googleId: session.googleId,
    });
  }

  @Get(":endpointId")
  async findEndpointById(
    @Param() params: FindEndpointByIdDto,
    @CurrentSession() session: ICurrentSession,
  ) {
    return this.findEndpointUseCase.execute({
      googleId: session.googleId,
      endpointId: params.endpointId,
    });
  }

  @Patch(":endpointId")
  async updateEndpoint(
    @Param() params: UpdateEndpointParamsDto,
    @Body() updateEndpointDto: UpdateEndpointBodyDto,
    @CurrentSession() session: ICurrentSession,
  ) {
    return this.updateEndpointUseCase.execute({
      ...updateEndpointDto,
      id: params.endpointId,
      googleId: session.googleId,
    });
  }
}
