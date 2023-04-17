import type { User, UserID } from '../dto';
import { MultiFileRepository } from '../fs';
import type { PIIHelper } from '../utils';

import { UserOrganizer } from './organizers';
import { UserSerializer } from './serialization';

export class UsersRepository extends MultiFileRepository<UserID, User> {
  constructor(rootDirectory: string, piiHelper: PIIHelper) {
    const fileOrganizer = new UserOrganizer(rootDirectory);
    const entitySerializer = new UserSerializer(piiHelper);

    super(fileOrganizer, entitySerializer);
  }
  public async updateByEmail(
    email: string,
    newDetails: Partial<User>,
  ): Promise<boolean> {
    const user = await this._findByEmail(email);
    if (user) {
      await this.update(user.id, newDetails);
      return true;
    }

    return false;
  }

  public async removeByEmail(email: string): Promise<boolean> {
    const user = await this._findByEmail(email);
    if (user) {
      await this.deleteById(user.id);
      return true;
    }

    return false;
  }

  private async _findByEmail(email: string) {
    return this.find((user) => user.email === email);
  }
}
