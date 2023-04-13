import type { User, UserID } from '../dto';
import { MultiFileRepository } from '../fs';

export class UsersRepository extends MultiFileRepository<UserID, User> {
  public async updateByEmail(
    email: string,
    newDetails: Partial<User>,
  ): Promise<boolean> {
    const user = await this._findByEmail(email);
    if (user) {
      this.update(user.id, newDetails);
      return true;
    }

    return false;
  }

  public async removeByEmail(email: string): Promise<boolean> {
    const user = await this._findByEmail(email);
    if (user) {
      this.removeById(user.id);
      return true;
    }

    return false;
  }

  private async _findByEmail(email: string) {
    return this.all.find((user) => user.email === email);
  }
}
