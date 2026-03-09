import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WrapperDataInterceptor } from "../shared/interceptors/wrapper-data/wrapper-data.interceptor";
import { NotFoundErrorFilter } from "../shared/filters/not-found-error.filter";

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new WrapperDataInterceptor());

  app.useGlobalFilters(new NotFoundErrorFilter());
}
