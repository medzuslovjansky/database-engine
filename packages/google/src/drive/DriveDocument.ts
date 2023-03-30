import { drive_v3 } from 'googleapis';
import { AuthClient } from '../auth/AuthClient';
import Drive = drive_v3.Drive;
import Schema$File = drive_v3.Schema$File;

type DriveDocumentCachedData = Partial<Schema$File>;

export type DriveDocumentConfig = {
  authClient: AuthClient;
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
  private readonly _authClient: AuthClient;
  private readonly _fileId: string;

  private readonly _drive: Drive;

  private readonly _cache: Partial<DriveDocumentCachedData> = {};

  constructor(config: DriveDocumentConfig) {
    this._authClient = config.authClient;
    this._fileId = config.fileId;
    this._drive = new Drive({
      auth: config.authClient,
    });

    Object.assign(this._cache, config.cachedData);
  }

  async getProperties(): Promise<DriveDocumentCachedData> {
    if (this._cache.mimeType) {
      return this._cache;
    }

    const res = await this._drive.files.get({
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

  async getPermissions(): Promise<drive_v3.Schema$Permission[]> {
    if (!this._cache.permissions) {
      const res = await this._drive.permissions.list({
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
  ) {
    const res = await this._drive.permissions.create({
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

    const res = await this._drive.permissions.delete({
      fileId: this._fileId,
      permissionId,
    });

    return res.data;
  }

  async listFiles() {
    const res = await this._drive.files.list({
      q: `'${this._fileId}' in parents`,
    });

    return (res.data.files ?? []).map(
      (f) =>
        new DriveDocument({
          authClient: this._authClient,
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
