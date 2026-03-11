import { IsNotEmpty, IsString } from "class-validator";
import { ClassValidatorFields } from "../shared/validators/class-validator-fields";
import { Notification } from "../shared/notification";
import { RefreshToken } from "./refresh-token.entity";

const refreshTokenValidationGroups = ["refreshTokenHash"] as const;

export type RefreshTokenValidationGroup =
  (typeof refreshTokenValidationGroups)[number];

class RefreshTokenRules {
  @IsNotEmpty({ groups: ["refreshTokenHash"] as RefreshTokenValidationGroup[] })
  @IsString({ groups: ["refreshTokenHash"] as RefreshTokenValidationGroup[] })
  _refreshTokenHash: string;

  constructor(entity: RefreshToken) {
    Object.assign(this, entity);
  }
}

export class RefreshTokenValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    data: RefreshToken,
    fields?: RefreshTokenValidationGroup[],
  ): boolean {
    const fieldsToValidate = fields?.length
      ? fields
      : refreshTokenValidationGroups;

    return super.validate(
      notification,
      new RefreshTokenRules(data),
      fieldsToValidate as string[],
    );
  }
}
