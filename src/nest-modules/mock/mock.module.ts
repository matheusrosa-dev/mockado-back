import { Module } from "@nestjs/common";
import { MockController } from "./mock.controller";
import { MOCK_PROVIDERS } from "./mock.provider";

@Module({
  controllers: [MockController],
  providers: [
    ...Object.values(MOCK_PROVIDERS.REPOSITORIES),
    ...Object.values(MOCK_PROVIDERS.USE_CASES),
  ],
})
export class MockModule {}
