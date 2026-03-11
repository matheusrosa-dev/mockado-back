import { IRepository } from "../shared/repositories/repository-interface";
import { User } from "./user.entity";

export interface IUserRepository extends IRepository<User> {
  findByGoogleId(googleId: string): Promise<User | null>;
}
