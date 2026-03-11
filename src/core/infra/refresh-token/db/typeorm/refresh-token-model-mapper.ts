import { LoadEntityError } from "@domain/shared/validators/validation.error";
import { RefreshToken } from "@domain/refresh-token/refresh-token.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { RefreshTokenModel } from "./refresh-token-typeorm.model";

export class RefreshTokenModelMapper {
  static toModel(entity: RefreshToken): RefreshTokenModel {
    const model = new RefreshTokenModel();

    model.refreshTokenId = entity.refreshTokenId.toString();
    model.userId = entity.userId.toString();
    model.refreshTokenHash = entity.refreshTokenHash;
    model.createdAt = entity.createdAt;

    return model;
  }

  static toEntity(model: RefreshTokenModel): RefreshToken {
    const refreshToken = new RefreshToken({
      refreshTokenId: new Uuid(model.refreshTokenId),
      userId: new Uuid(model.userId),
      refreshTokenHash: model.refreshTokenHash,
      createdAt: model.createdAt,
    });

    refreshToken.validate();

    if (refreshToken.notification.hasErrors()) {
      throw new LoadEntityError(refreshToken.notification.toJSON());
    }

    return refreshToken;
  }
}
