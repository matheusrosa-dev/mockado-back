import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1773276205335 implements MigrationInterface {
  name = "Migrations1773276205335";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("refresh_token_id" uuid NOT NULL, "user_id" uuid NOT NULL, "refresh_token_hash" character varying(500) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9dbdad80950b681a645b4f6373a" PRIMARY KEY ("refresh_token_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" uuid NOT NULL, "google_id" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."endpoints_method_enum" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."endpoints_response_body_type_enum" AS ENUM('json', 'text', 'null', 'empty')`,
    );
    await queryRunner.query(
      `CREATE TABLE "endpoints" ("endpoint_id" uuid NOT NULL, "title" character varying(50) NOT NULL, "method" "public"."endpoints_method_enum" NOT NULL, "description" character varying(200) NOT NULL DEFAULT '', "delay" integer NOT NULL DEFAULT '0', "status_code" integer NOT NULL, "response_body_type" "public"."endpoints_response_body_type_enum", "response_json" text, "response_text" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e48b720c7298270fc3360cc773" PRIMARY KEY ("endpoint_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(`DROP TABLE "endpoints"`);
    await queryRunner.query(
      `DROP TYPE "public"."endpoints_response_body_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."endpoints_method_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
