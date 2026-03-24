import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveApiKeyHash1774354418216 implements MigrationInterface {
  name = "RemoveApiKeyHash1774354418216";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_249dd0446292ecf28e3d1e7cc4c"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "api_key_hash"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "api_key_hash" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_249dd0446292ecf28e3d1e7cc4c" UNIQUE ("api_key_hash")`,
    );
  }
}
