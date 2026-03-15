import { RefreshTokenFactory } from "@domain/refresh-token/refresh-token.entity";
import { setupTypeOrm } from "@infra/shared/testing/helpers";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";
import { TypeOrmGoogleLoginUnitOfWork } from "../typeorm-google-login.unit-of-work";
import { UserFactory } from "@domain/user/user.entity";
import { UserTypeOrmRepository } from "@infra/user/db/typeorm/user-typeorm.repository";
import { RefreshTokenTypeOrmRepository } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.repository";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

describe("TypeOrm Google Login Unit Of Work - Integration Tests", () => {
  const { dataSource } = setupTypeOrm({
    entities: [RefreshTokenModel, UserModel, EndpointModel],
  });

  let unitOfWork: TypeOrmGoogleLoginUnitOfWork;
  let userRepository: UserTypeOrmRepository;
  let refreshTokenRepository: RefreshTokenTypeOrmRepository;

  beforeEach(() => {
    unitOfWork = new TypeOrmGoogleLoginUnitOfWork(dataSource);
    userRepository = new UserTypeOrmRepository(dataSource);
    refreshTokenRepository = new RefreshTokenTypeOrmRepository(dataSource);
  });

  it("should commit all writes when transaction succeeds", async () => {
    const user = UserFactory.fake().oneUser().build();

    await unitOfWork.runInTransaction(async (repositories) => {
      await repositories.userRepository.insert(user);

      const refreshToken = RefreshTokenFactory.create({
        userId: user.userId,
        googleId: user.googleId,
        refreshTokenHash: "hashed-token",
      });

      await repositories.refreshTokenRepository.insert(refreshToken);
    });

    const savedUser = await userRepository.findByGoogleId(user.googleId);
    const savedTokens = await refreshTokenRepository.findManyByAnyId({
      userId: user.userId,
    });

    expect(savedUser).not.toBeNull();
    expect(savedTokens).toHaveLength(1);
    expect(savedTokens[0].refreshTokenHash).toBe("hashed-token");
  });

  it("should rollback all writes when transaction fails", async () => {
    const user = UserFactory.fake().oneUser().build();

    await expect(
      unitOfWork.runInTransaction(async (repositories) => {
        await repositories.userRepository.insert(user);

        const refreshToken = RefreshTokenFactory.create({
          userId: user.userId,
          googleId: user.googleId,
          refreshTokenHash: "hashed-token",
        });

        await repositories.refreshTokenRepository.insert(refreshToken);

        throw new Error("force rollback");
      }),
    ).rejects.toThrow("force rollback");

    const savedUser = await userRepository.findByGoogleId(user.googleId);
    const savedTokens = await refreshTokenRepository.findManyByAnyId({
      userId: user.userId,
    });

    expect(savedUser).toBeNull();
    expect(savedTokens).toHaveLength(0);
  });
});
