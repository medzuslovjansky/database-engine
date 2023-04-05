import findKey from 'lodash/findKey';
import merge from 'lodash/merge';
import {UserConfig, UsersConfig} from "../dto";
import {ConfigManager} from "./ConfigManager";

export class UsersManager {
  constructor(protected readonly manager: ConfigManager) {}

  get config(): UsersConfig {
    return this.manager.config.users;
  }

  public addUser(id: string, user: UserConfig): void {
    this.config.users[id] = user;
  }

  public updateUserById(id: string, user: UserConfig): void {
    merge(this.config[id], user);
  }

  public updateUserByEmail(email: string, user: UserConfig): void {
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
