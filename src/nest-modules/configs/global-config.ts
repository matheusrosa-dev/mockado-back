import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WrapperDataInterceptor } from "../shared/interceptors/wrapper-data.interceptor";
import { NotFoundErrorFilter } from "../shared/filters/not-found-error.filter";
import { EntityValidationErrorFilter } from "../shared/filters/entity-validation-error.filter";
import cookieParser from "cookie-parser";

export function applyGlobalConfig(app: INestApplication) {
  app.enableCors({
    origin: ["http://localhost:3000", "https://mockado-omega.vercel.app"],
    allowedHeaders: ["Content-Type", "Cookie", "Authorization"],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new WrapperDataInterceptor());

  app.useGlobalFilters(
    new EntityValidationErrorFilter(),
    new NotFoundErrorFilter(),
  );
}
