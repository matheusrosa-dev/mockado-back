import { IRepository } from "../shared/repositories/repository-interface";
import { Uuid } from "../shared/value-objects/uuid.vo";
import { User } from "./user.entity";

export interface IUserRepository extends IRepository<User, Uuid> {}
