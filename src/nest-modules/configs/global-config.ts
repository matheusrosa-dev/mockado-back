import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WrapperDataInterceptor } from "../shared/interceptors/wrapper-data/wrapper-data.interceptor";
import { NotFoundErrorFilter } from "../shared/filters/not-found-error.filter";
import { EntityValidationErrorFilter } from "../shared/filters/entity-validation-error.filter";
import cookieParser from "cookie-parser";

export function applyGlobalConfig(app: INestApplication) {
  app.enableCors({
    origin: true,
    allowedHeaders: "*",
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new WrapperDataInterceptor());

  app.useGlobalFilters(
    new EntityValidationErrorFilter(),
    new NotFoundErrorFilter(),
  );
}
