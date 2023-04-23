import type { drive_v3 } from 'googleapis';

type DriveDocumentCachedData = {
  mimeType?: string | null;
  name?: string | null;
  permissions?: DriveDocumentPermission[] | null;
};

type DriveDocumentPermission = {
  id?: string | null;
  type?: string | null;
  displayName?: string | null;
  emailAddress?: string | null;
  role?: string | null;
};

export type DriveDocumentConfig = {
  api: drive_v3.Drive;
  fileId: string;
  cachedData?: DriveDocumentCachedData;
};

export type CreatePermissionOptions = {
  emailMessage?: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role:
    | 'owner'
    | 'organizer'
    | 'fileOrganizer'
    | 'writer'
    | 'commenter'
    | 'reader';
};

export class DriveDocument {
  private readonly _fileId: string;

  private readonly _api: drive_v3.Drive;

  private readonly _cache: Partial<DriveDocumentCachedData> = {};

  constructor(config: DriveDocumentConfig) {
    this._api = config.api;
    this._fileId = config.fileId;
    Object.assign(this._cache, config.cachedData);
  }

  async getProperties(): Promise<DriveDocumentCachedData> {
    if (this._cache.mimeType) {
      return this._cache;
    }

    const res = await this._api.files.get({
      fileId: this._fileId,
      fields: '*',
    });

    Object.assign(this._cache, res.data);
    return res.data;
  }

  async getName(): Promise<string> {
    if (!this._cache.name) {
      await this.getProperties();
    }

    return this._cache.name!;
  }

  async getPermissions(): Promise<DriveDocumentPermission[]> {
    if (!this._cache.permissions) {
      const res = await this._api.permissions.list({
        fileId: this._fileId,
        fields: '*', // TODO: check how to get only the fields we need
      });

      this._cache.permissions = res.data.permissions ?? [];
    }

    const permissions = this._cache.permissions!;
    return permissions.filter((p) => p.id && p.id !== 'anyoneWithLink');
  }

  async createPermission(
    emailAddress: string,
    options?: CreatePermissionOptions,
  ): Promise<DriveDocumentPermission> {
    const res = await this._api.permissions.create({
      fileId: this._fileId,
      emailMessage: options?.emailMessage,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress,
      },
    });

    delete this._cache.permissions;
    return res.data;
  }

  async deletePermission(emailAddress: string) {
    const permissionId = await this._findPermissionId(emailAddress);

    const res = await this._api.permissions.delete({
      fileId: this._fileId,
      permissionId,
    });

    return res.data;
  }

  async listFiles() {
    const res = await this._api.files.list({
      q: `'${this._fileId}' in parents`,
    });

    return (res.data.files ?? []).map(
      (f) =>
        new DriveDocument({
          api: this._api,
          fileId: f.id!,
          cachedData: f,
        }),
    );
  }

  private async _findPermissionId(emailAddress: string): Promise<string> {
    const permisisons = await this.getPermissions();
    const result = permisisons.find((p) => p.emailAddress === emailAddress);

    if (!result) {
      throw new Error(`Permission not found for ${emailAddress}`);
    }

    return result.id!;
  }
}
