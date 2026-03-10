import { EntityValidationError } from "@domain/shared/validators/validation.error";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(422).json({
      statusCode: 422,
      error: "Unprocessable Entity",
      message: [
        ...new Set(
          exception.error.flatMap((error) =>
            typeof error === "string" ? [error] : Object.values(error).flat(),
          ),
        ),
      ],
    });
  }
}
