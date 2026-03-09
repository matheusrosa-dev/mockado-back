import { Module } from "@nestjs/common";
import { EndpointsModule } from "./endpoints/endpoints.module";
import { DatabasesModule } from "./databases/databases.module";
import { ConfigsModule } from "./configs/configs.module";

@Module({
  imports: [ConfigsModule, DatabasesModule, EndpointsModule],
})
export class AppModule {}
