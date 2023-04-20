import type { Config, UserConfig } from '@interslavic/database-engine-fs';
import { snakeCase, values } from 'lodash';
import type { drive_v3 } from 'googleapis';

import { SyncOperation } from '../utils';

export type PermissionSync2ConfigConfig = {
  configManager: Config;
  googleSheets: any;
};

type CombinedUserConfig = UserConfig & {
  role: string;
};

export class PermissionSync2Config extends SyncOperation<
  CombinedUserConfig,
  drive_v3.Schema$Permission
> {
  private readonly configManager: Config;
  private readonly googleSheets: any;

  constructor(config: PermissionSync2ConfigConfig) {
    super();

    this.configManager = config.configManager;
    this.googleSheets = config.googleSheets;
  }
  protected async getBefore(): Promise<CombinedUserConfig[]> {
    const config = await this.configManager.load();
    return values(config.users.config).map((user) => ({ ...user, role: '' }));
  }

  protected async getAfter(): Promise<drive_v3.Schema$Permission[]> {
    return this.googleSheets.getSharedAccounts();
  }

  protected async update(
    _before: CombinedUserConfig,
    _after: drive_v3.Schema$Permission,
  ): Promise<void> {
    // this.configManager.updateUserByEmail(before.email, {
    //   email: after.emailAddress!,
    //   role:
    //     after.role === 'writer' || after.role === 'owner' ? 'editor' : 'reader',
    // });
  }

  protected async delete(r: CombinedUserConfig): Promise<void> {
    this.configManager.users.removeUserByEmail(r.email);
  }

  protected extractIdBefore(r: CombinedUserConfig): string {
    return r.email;
  }

  protected extractIdAfter(r: drive_v3.Schema$Permission): string {
    return r.emailAddress!;
  }

  protected async insert(r: drive_v3.Schema$Permission): Promise<void> {
    this.configManager.users.addUser(
      snakeCase(r.emailAddress!.split('@')[0]!),
      {
        email: r.emailAddress!,
        comment: '',
      },
    );
  }

  protected async commit() {
    await this.configManager.save();
  }
}
