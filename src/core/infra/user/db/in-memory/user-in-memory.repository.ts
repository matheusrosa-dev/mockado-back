import { IUserRepository } from "@domain/user/user.repository";
import { InMemoryRepository } from "../../../shared/db/in-memory/in-memory.repository";
import { User } from "@domain/user/user.entity";

export class UserInMemoryRepository
  extends InMemoryRepository<User>
  implements IUserRepository
{
  findByGoogleId(googleId: string): Promise<User | null> {
    const user = this.items.find((user) => user.googleId === googleId);

    if (!user) {
      return Promise.resolve(null);
    }

    return Promise.resolve(user);
  }

  getEntity() {
    return User;
  }
}
