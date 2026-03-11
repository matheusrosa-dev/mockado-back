import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { UserModel } from "@infra/user/db/typeorm/user-typeorm.model";

@Entity({ name: "refresh_tokens" })
export class RefreshTokenModel {
  @PrimaryColumn({
    name: "refresh_token_id",
    type: "uuid",
    nullable: false,
  })
  refreshTokenId: string;

  @Column({
    name: "user_id",
    type: "uuid",
    nullable: false,
  })
  userId: string;

  @Column({
    name: "refresh_token_hash",
    type: "varchar",
    length: 500,
    nullable: false,
  })
  refreshTokenHash: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(
    () => UserModel,
    (user) => user.refreshTokens,
    {
      nullable: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "user_id" })
  user: UserModel;
}
