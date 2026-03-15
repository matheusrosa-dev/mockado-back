import {
  apiConfig,
  authConfig,
  databaseConfig,
  validationSchema,
} from "../env-config";
import type { IDatabaseConfig } from "../configs.interface";

const validEnvBase = {
  API_PORT: "3000",
  DB_TYPE: "postgres",
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_USERNAME: "user",
  DB_PASSWORD: "password",
  DB_DATABASE: "mockado",
  DB_MIGRATIONS_AUTO_RUN: "true",
  GOOGLE_CLIENT_ID: "google-client-id",
  JWT_SECRET: "jwt-secret",
  JWT_REFRESH_SECRET: "jwt-refresh-secret",
  JWT_EXPIRATION_TIME: "3600",
  JWT_REFRESH_EXPIRATION_TIME: "86400",
};

function validateEnv(env: Record<string, string>) {
  return validationSchema.validate(env, { abortEarly: false });
}

describe("Env Config - Unit Tests", () => {
  describe("validationSchema", () => {
    it("should pass with all valid postgres env vars", () => {
      const { error } = validateEnv(validEnvBase);
      expect(error).toBeUndefined();
    });

    it("should pass with sqlite (no host/port/username/password required)", () => {
      const { API_PORT, DB_DATABASE, DB_MIGRATIONS_AUTO_RUN } = validEnvBase;
      const { error } = validateEnv({
        API_PORT,
        DB_TYPE: "sqlite",
        DB_DATABASE,
        DB_MIGRATIONS_AUTO_RUN,
        GOOGLE_CLIENT_ID: validEnvBase.GOOGLE_CLIENT_ID,
        JWT_SECRET: validEnvBase.JWT_SECRET,
        JWT_REFRESH_SECRET: validEnvBase.JWT_REFRESH_SECRET,
        JWT_EXPIRATION_TIME: validEnvBase.JWT_EXPIRATION_TIME,
        JWT_REFRESH_EXPIRATION_TIME: validEnvBase.JWT_REFRESH_EXPIRATION_TIME,
      });
      expect(error).toBeUndefined();
    });

    describe("API_PORT", () => {
      it("should fail when API_PORT is missing", () => {
        const { API_PORT, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "API_PORT")).toBe(
          true,
        );
      });

      it("should fail when API_PORT is not a number", () => {
        const { error } = validateEnv({ ...validEnvBase, API_PORT: "abc" });
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "API_PORT")).toBe(
          true,
        );
      });
    });

    describe("DB_TYPE", () => {
      it("should fail when DB_TYPE is missing", () => {
        const { DB_TYPE, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "DB_TYPE")).toBe(
          true,
        );
      });

      it("should fail when DB_TYPE is an invalid value", () => {
        const { error } = validateEnv({ ...validEnvBase, DB_TYPE: "mysql" });
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "DB_TYPE")).toBe(
          true,
        );
      });
    });

    describe("DB_HOST (postgres only)", () => {
      it("should fail when DB_TYPE is postgres and DB_HOST is missing", () => {
        const { DB_HOST, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "DB_HOST")).toBe(
          true,
        );
      });
    });

    describe("DB_PORT (postgres only)", () => {
      it("should fail when DB_TYPE is postgres and DB_PORT is missing", () => {
        const { DB_PORT, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === "DB_PORT")).toBe(
          true,
        );
      });
    });

    describe("DB_USERNAME (postgres only)", () => {
      it("should fail when DB_TYPE is postgres and DB_USERNAME is missing", () => {
        const { DB_USERNAME, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(
          error!.details.some((d) => d.context?.key === "DB_USERNAME"),
        ).toBe(true);
      });
    });

    describe("DB_PASSWORD (postgres only)", () => {
      it("should fail when DB_TYPE is postgres and DB_PASSWORD is missing", () => {
        const { DB_PASSWORD, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(
          error!.details.some((d) => d.context?.key === "DB_PASSWORD"),
        ).toBe(true);
      });
    });

    describe("DB_DATABASE", () => {
      it("should fail when DB_DATABASE is missing", () => {
        const { DB_DATABASE, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(
          error!.details.some((d) => d.context?.key === "DB_DATABASE"),
        ).toBe(true);
      });
    });

    describe("DB_MIGRATIONS_AUTO_RUN", () => {
      it("should fail when DB_MIGRATIONS_AUTO_RUN is missing", () => {
        const { DB_MIGRATIONS_AUTO_RUN, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(
          error!.details.some(
            (d) => d.context?.key === "DB_MIGRATIONS_AUTO_RUN",
          ),
        ).toBe(true);
      });

      it("should fail when DB_MIGRATIONS_AUTO_RUN is not a boolean", () => {
        const { error } = validateEnv({
          ...validEnvBase,
          DB_MIGRATIONS_AUTO_RUN: "yes",
        });
        expect(error).toBeDefined();
        expect(
          error!.details.some(
            (d) => d.context?.key === "DB_MIGRATIONS_AUTO_RUN",
          ),
        ).toBe(true);
      });
    });

    describe("JWT fields", () => {
      it.each([
        "JWT_SECRET",
        "JWT_REFRESH_SECRET",
        "JWT_EXPIRATION_TIME",
        "JWT_REFRESH_EXPIRATION_TIME",
      ])("should fail when %s is missing", (key) => {
        const env = { ...validEnvBase } as Record<string, string>;
        delete env[key];
        const { error } = validateEnv(env);
        expect(error).toBeDefined();
        expect(error!.details.some((d) => d.context?.key === key)).toBe(true);
      });
    });

    describe("GOOGLE_CLIENT_ID", () => {
      it("should fail when GOOGLE_CLIENT_ID is missing", () => {
        const { GOOGLE_CLIENT_ID, ...env } = validEnvBase;
        const { error } = validateEnv(env as Record<string, string>);
        expect(error).toBeDefined();
        expect(
          error!.details.some((d) => d.context?.key === "GOOGLE_CLIENT_ID"),
        ).toBe(true);
      });
    });
  });

  describe("apiConfig", () => {
    it("should return the correct api config", () => {
      process.env.API_PORT = "3000";
      const config = apiConfig();
      expect(config).toStrictEqual({ port: 3000 });
    });
  });

  describe("databaseConfig", () => {
    it("should return the correct postgres config", () => {
      Object.assign(process.env, {
        DB_TYPE: "postgres",
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "user",
        DB_PASSWORD: "password",
        DB_DATABASE: "mockado",
        DB_MIGRATIONS_AUTO_RUN: "true",
      });

      const config = databaseConfig();
      expect(config).toStrictEqual({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "mockado",
        migrationsRun: true,
      });
    });

    it("should return migrationsRun as false when DB_MIGRATIONS_AUTO_RUN is 'false'", () => {
      process.env.DB_MIGRATIONS_AUTO_RUN = "false";
      const config = databaseConfig() as IDatabaseConfig;
      expect(config.migrationsRun).toBe(false);
    });
  });

  describe("authConfig", () => {
    it("should return the correct auth config", () => {
      Object.assign(process.env, {
        GOOGLE_CLIENT_ID: "google-client-id",
        JWT_SECRET: "jwt-secret",
        JWT_REFRESH_SECRET: "jwt-refresh-secret",
        JWT_EXPIRATION_TIME: "3600",
        JWT_REFRESH_EXPIRATION_TIME: "86400",
      });

      const config = authConfig();
      expect(config).toStrictEqual({
        googleClientId: "google-client-id",
        jwtSecret: "jwt-secret",
        jwtRefreshSecret: "jwt-refresh-secret",
        jwtExpirationTime: 3600,
        jwtRefreshExpirationTime: 86400,
      });
    });
  });
});
