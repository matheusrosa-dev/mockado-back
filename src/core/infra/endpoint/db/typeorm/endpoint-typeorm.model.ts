import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import {
  HttpMethod,
  ResponseBodyType,
} from "../../../../domain/endpoint/endpoint.types";

@Entity({ name: "endpoints" })
export class EndpointModel {
  @PrimaryColumn({ type: "uuid", nullable: false })
  endpoint_id: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  title: string;

  @Column({ type: "simple-enum", enum: HttpMethod, nullable: false })
  method: HttpMethod;

  @Column({ type: "varchar", length: 200, default: "", nullable: false })
  description: string;

  @Column({ type: "int", default: 0, nullable: false })
  delay: number;

  @Column({ type: "int", nullable: false })
  statusCode: number;

  @Column({
    type: "simple-enum",
    enum: ResponseBodyType,
    nullable: true,
    default: null,
  })
  responseBodyType: ResponseBodyType | null;

  @Column({ type: "text", nullable: true, default: null })
  responseJson: string | null;

  @Column({ type: "text", nullable: true, default: null })
  responseText: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
