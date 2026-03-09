import { registerAs } from "@nestjs/config";
import { IApiConfig, IDatabaseConfig } from "./configs.interface";

import * as Joi from "joi";
import "dotenv/config";

export const apiConfig = registerAs<IApiConfig>("api", () => ({
  port: Number(process.env.API_PORT),
}));

export const databaseConfig = registerAs<IDatabaseConfig>("database", () => ({
  type: process.env.DB_TYPE as IDatabaseConfig["type"],
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE!,
  migrationsRun: process.env.DB_MIGRATIONS_AUTO_RUN === "true",
}));

export const validationSchema = Joi.object({
  API_PORT: Joi.number().required(),

  DB_TYPE: Joi.string().valid("sqlite", "postgres").required(),
  DB_HOST: Joi.string().when("DB_TYPE", {
    is: "postgres",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_PORT: Joi.number().when("DB_TYPE", {
    is: "postgres",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_USERNAME: Joi.string().when("DB_TYPE", {
    is: "postgres",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_PASSWORD: Joi.string().when("DB_TYPE", {
    is: "postgres",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_DATABASE: Joi.string().required(),
  DB_MIGRATIONS_AUTO_RUN: Joi.boolean().required(),
});
