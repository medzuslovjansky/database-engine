import findKey from 'lodash/findKey';
import merge from 'lodash/merge';

import type { UserConfig, UsersConfig } from '../dto';

import type { AggregatedConfigManager } from './AggregatedConfigManager';

export class UsersManager {
  constructor(protected readonly manager: AggregatedConfigManager) {}

  get config(): UsersConfig {
    return this.manager.config.users;
  }

  public addUser(id: string, user: UserConfig): void {
    this.config[id] = user;
  }

  public updateUserById(id: string, user: Partial<UserConfig>): void {
    merge(this.config[id], user);
  }

  public updateUserByEmail(email: string, user: Partial<UserConfig>): void {
    const id = this._findIdByEmail(email);
    if (id) {
      this.updateUserById(id, user);
    }
  }

  public removeUserById(id: string): void {
    delete this.config[id];
  }

  public removeUserByEmail(email: string): void {
    const id = this._findIdByEmail(email);
    if (id) {
      this.removeUserById(id);
    }
  }

  private _findIdByEmail(email: string): string | undefined {
    return findKey(this.config, { email });
  }
}
