import { DataSource, DataSourceOptions } from "typeorm";

type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type SetupTypeOrmOptions = MakeRequired<Partial<DataSourceOptions>, "entities">;

export function setupTypeOrm(options: SetupTypeOrmOptions) {
  const dataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    synchronize: true,
    logging: false,
    ...(options as object),
  });

  beforeEach(async () => {
    await dataSource.initialize();
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  return { dataSource };
}
