import type { Config, UserConfig } from '@interslavic/database-engine-fs';
import { values } from 'lodash';
import type { drive_v3 } from 'googleapis';

import { SyncOperation } from '../utils';

export type PermissionSync2GoogleConfig = {
  configManager: Config;
  googleSheets: any;
};

type CombinedUserConfig = UserConfig & {
  role: string;
};

export class PermissionSync2Google extends SyncOperation<
  drive_v3.Schema$Permission,
  CombinedUserConfig
> {
  private readonly configManager: Config;
  private readonly googleSheets: any;

  constructor(config: PermissionSync2GoogleConfig) {
    super();

    this.configManager = config.configManager;
    this.googleSheets = config.googleSheets;
  }

  protected async getAfter(): Promise<CombinedUserConfig[]> {
    const config = await this.configManager.load();
    return values(config.users.config).map((user) => ({ ...user, role: '' }));
  }

  protected async getBefore(): Promise<drive_v3.Schema$Permission[]> {
    return this.googleSheets.getSharedAccounts();
  }

  protected async update(
    before: drive_v3.Schema$Permission,
    after: CombinedUserConfig,
  ): Promise<void> {
    if (before.role !== after.role) {
      return after.role !== 'editor' && after.role !== 'owner'
        ? this.delete(before)
        : this.insert(after);
    }
  }

  protected async delete(r: drive_v3.Schema$Permission): Promise<void> {
    await this.googleSheets.revokePermission(r.id!);
  }

  protected extractIdAfter(r: CombinedUserConfig): string {
    return r.email;
  }

  protected extractIdBefore(r: drive_v3.Schema$Permission): string {
    return r.emailAddress!;
  }

  protected async insert(r: CombinedUserConfig): Promise<void> {
    await this.googleSheets.grantPermission(r.email);
  }
}
