import {
  All,
  Controller,
  Headers,
  Param,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../shared/decorators/public.decorator";
import { ApiKeyGuard } from "../shared/guards/api-key.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { MockEndpointUseCase } from "@app/endpoint/use-cases/mock-endpoint/mock-endpoint.use-case";
import type { Request, Response } from "express";
import { MockEndpointDto } from "./dtos/mock-endpoint.dto";
import { HttpMethod } from "@domain/endpoint/endpoint.types";

@Controller("mock")
export class MockController {
  constructor(private mockEndpointUseCase: MockEndpointUseCase) {}

  @Public()
  @UseGuards(ApiKeyGuard, ThrottlerGuard)
  @All(":endpointId")
  async mockEndpoint(
    @Req() req: Request,
    @Res() res: Response,

    @Param() params: MockEndpointDto,
    @Headers("x-api-key") apiKey: string,
  ) {
    const output = await this.mockEndpointUseCase.execute({
      endpointId: params.endpointId,
      apiKey,
      method: req.method as HttpMethod,
    });

    await new Promise((resolve) => setTimeout(resolve, output.delay * 1000));

    return res.status(output.statusCode).send(output.response);
  }
}
