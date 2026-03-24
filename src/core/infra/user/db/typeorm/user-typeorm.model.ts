import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  type Relation,
} from "typeorm";
import { RefreshTokenModel } from "@infra/refresh-token/db/typeorm/refresh-token-typeorm.model";
import { EndpointModel } from "@infra/endpoint/db/typeorm/endpoint-typeorm.model";

@Entity({ name: "users" })
export class UserModel {
  @PrimaryColumn({
    name: "id",
    type: "uuid",
    nullable: false,
  })
  userId: string;

  @Column({
    name: "google_id",
    type: "varchar",
    length: 255,
    nullable: false,
    unique: true,
  })
  googleId: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(
    () => RefreshTokenModel,
    (refreshToken) => refreshToken.user,
  )
  refreshTokens: Relation<RefreshTokenModel[]>;

  @OneToMany(
    () => EndpointModel,
    (endpoint) => endpoint.user,
  )
  endpoints: Relation<EndpointModel[]>;
}
