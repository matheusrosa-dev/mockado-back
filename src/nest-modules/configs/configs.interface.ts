export interface IDatabaseConfig {
  type: "sqlite" | "postgres";
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  migrationsRun?: boolean;
  database: string;
}

export interface IApiConfig {
  port: number;
}
