import { Controller, Get, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundErrorFilter } from "../not-found-error.filter";
import request from "supertest";
import { Entity } from "@domain/shared/entity";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";

class StubEntity extends Entity {
  entity_id: Uuid;
  toJSON() {
    return {};
  }
}

const id = new Uuid();

@Controller("stub")
class StubController {
  @Get()
  index() {
    throw new NotFoundError(id, StubEntity);
  }
}

describe("Not Found Error Filter - Unit Tests", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new NotFoundErrorFilter());
    await app.init();
  });

  it("should catch a Not Found Error", () => {
    return request(app.getHttpServer())
      .get("/stub")
      .expect(404)
      .expect({
        statusCode: 404,
        error: "Not Found",
        message: `StubEntity Not Found using ID: ${id.toString()}`,
      });
  });
});
