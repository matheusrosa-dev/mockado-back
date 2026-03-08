import { DataSource, DataSourceOptions } from "typeorm";

type SetupTypeOrmOptions = Partial<DataSourceOptions>;

export function setupTypeOrm(options: SetupTypeOrmOptions = {}) {
  const typeorm = new DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    synchronize: true,
    logging: false,
    ...(options as object),
  });

  beforeEach(async () => {
    await typeorm.initialize();
  });

  afterEach(async () => {
    if (typeorm.isInitialized) {
      await typeorm.destroy();
    }
  });

  return { typeorm };
}
