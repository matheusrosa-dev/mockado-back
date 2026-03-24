import { LoadEntityError } from "@domain/shared/validators/validation.error";
import { User } from "@domain/user/user.entity";
import { Uuid } from "@domain/shared/value-objects/uuid.vo";
import { UserModel } from "./user-typeorm.model";

export class UserModelMapper {
  static toModel(entity: User): UserModel {
    const model = new UserModel();

    model.userId = entity.userId.toString();
    model.googleId = entity.googleId;
    model.email = entity.email;
    model.name = entity.name;
    model.isActive = entity.isActive;
    model.createdAt = entity.createdAt;

    return model;
  }

  static toEntity(model: UserModel): User {
    const user = new User({
      userId: new Uuid(model.userId),
      googleId: model.googleId,
      email: model.email,
      name: model.name,
      isActive: model.isActive,

      createdAt: model.createdAt,
    });

    user.validate();

    if (user.notification.hasErrors()) {
      throw new LoadEntityError(user.notification.toJSON());
    }

    return user;
  }
}
