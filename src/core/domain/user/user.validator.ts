import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { User } from "./user.entity";
import { ClassValidatorFields } from "../shared/validators/class-validator-fields";
import { Notification } from "../shared/notification";

const userValidationGroups = ["googleId", "email", "name", "isActive"] as const;

export type UserValidationGroup = (typeof userValidationGroups)[number];

class UserRules {
  @IsNotEmpty({ groups: ["googleId"] as UserValidationGroup[] })
  @IsString({ groups: ["googleId"] as UserValidationGroup[] })
  @Matches(/^\d+$/, {
    groups: ["googleId"] as UserValidationGroup[],
    message: "Only digits are allowed in googleId",
  })
  @Length(21, 21, {
    groups: ["googleId"] as UserValidationGroup[],
    message: "googleId must be exactly 21 digits",
  })
  _googleId: string;

  @IsNotEmpty({ groups: ["email"] as UserValidationGroup[] })
  @IsEmail({}, { groups: ["email"] as UserValidationGroup[] })
  _email: string;

  @IsNotEmpty({ groups: ["name"] as UserValidationGroup[] })
  @IsString({ groups: ["name"] as UserValidationGroup[] })
  _name: string;

  @IsNotEmpty({ groups: ["isActive"] as UserValidationGroup[] })
  @IsBoolean({ groups: ["isActive"] as UserValidationGroup[] })
  _isActive: boolean;

  constructor(entity: User) {
    Object.assign(this, entity);
  }
}

export class UserValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    data: User,
    fields?: UserValidationGroup[],
  ): boolean {
    const fieldsToValidate = fields?.length ? fields : userValidationGroups;

    return super.validate(
      notification,
      new UserRules(data),
      fieldsToValidate as string[],
    );
  }
}
