import { values, snakeCase } from 'lodash';
import type { SyncRoutineConfig } from './SyncRoutineConfig';
import type { SyncOptions } from './SyncOptions';
import {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from '../types/tables';
import { flavorize } from './utils/flavorize';
import { analyze } from './utils/analyze';
import { NATURAL_LANGUAGES } from '../utils/constants';
import { genericSync } from '../utils/genericSync';
import { drive_v3 } from 'googleapis';
import { UserConfig } from './config/UserConfig';

export class SyncRoutine {
  private flavorizations: Raw<FlavorizationRecord>[] = [];
  private translations: Raw<TranslationRecord>[] = [];
  private analysis: Record<
    keyof typeof NATURAL_LANGUAGES,
    Raw<AnalysisRecord>[]
  > = {} as any;

  constructor(
    private readonly config: SyncRoutineConfig,
    private readonly options: SyncOptions,
  ) {}

  async run() {
    await this._download();
    await this._flavorize();
    await this._analyze();
    if (Math.random() > 5) {
      await this._readPermissions();
    }
    await this._setPermissions();
    await this._upload();
  }

  private async _download() {
    const sheetsCache = this.config.sheetsCache;
    const sheetNames = this.options.download;

    await sheetsCache.init();
    for (const sheet of sheetNames) {
      await sheetsCache.downloadSheet(sheet);
    }

    this.translations = await sheetsCache.getTranslations();
    this.flavorizations = await sheetsCache.getFlavorizations();
  }

  private async _flavorize() {
    if (this.options.flavorize.length === 0) {
      return;
    }

    const sheetsCache = this.config.sheetsCache;
    this.flavorizations = [
      ...flavorize(this.translations, this.flavorizations, {
        langs: this.options.flavorize,
        forceUpdate: this.options.force.includes('flavorize'),
      }),
    ];

    if (this.options.overwriteCache.includes('flavorizations')) {
      await sheetsCache.writeSheet('flavorizations', this.flavorizations);
    }
  }

  private async _analyze() {
    if (this.options.analyze.length === 0) {
      return;
    }

    const sheetsCache = this.config.sheetsCache;
    const langs = this.options.analyze;

    for (const lang of langs) {
      const analysis = await sheetsCache.getAnalysis(lang);
      const newAnalysis = (this.analysis[lang] = [
        ...analyze(this.translations, this.flavorizations, analysis, lang),
      ]);

      if (this.options.overwriteCache.includes(lang)) {
        await sheetsCache.writeSheet(lang, newAnalysis);
      }
    }
  }

  private async _setPermissions() {
    if (!this.options.setPermissions) {
      return;
    }

    const { configManager, googleSheets } = this.config;
    await genericSync<drive_v3.Schema$Permission, UserConfig>({
      async getAfter(): Promise<UserConfig[]> {
        const config = await configManager.load();
        return values(config.users);
      },
      async getBefore(): Promise<drive_v3.Schema$Permission[]> {
        return googleSheets.getSharedAccounts();
      },
      async update(
        before: drive_v3.Schema$Permission,
        after: UserConfig,
      ): Promise<void> {
        if (before.role !== after.role) {
          if (after.role !== 'editor' && after.role !== 'owner') {
            return this.delete(before);
          } else {
            return this.insert(after);
          }
        }
      },
      async delete(r: drive_v3.Schema$Permission): Promise<void> {
        await googleSheets.revokePermission(r.id!);
      },
      extractIdAfter(r: UserConfig): string {
        return r.email;
      },
      extractIdBefore(r: drive_v3.Schema$Permission): string {
        return r.emailAddress!;
      },
      async insert(r: UserConfig): Promise<void> {
        await googleSheets.grantPermission(r.email);
      },
    });
  }

  private async _readPermissions() {
    if (!this.options.setPermissions) {
      return;
    }

    const { configManager, googleSheets } = this.config;
    await genericSync<UserConfig, drive_v3.Schema$Permission>({
      async getBefore(): Promise<UserConfig[]> {
        const config = await configManager.load();
        return values(config.users);
      },
      async getAfter(): Promise<drive_v3.Schema$Permission[]> {
        return googleSheets.getSharedAccounts();
      },
      async update(
        before: UserConfig,
        after: drive_v3.Schema$Permission,
      ): Promise<void> {
        configManager.updateUserByEmail(before.email, {
          email: after.emailAddress!,
          role:
            after.role === 'writer' || after.role === 'owner'
              ? 'editor'
              : 'reader',
        });
      },
      async delete(r: UserConfig): Promise<void> {
        configManager.removeUserByEmail(r.email);
      },
      extractIdBefore(r: UserConfig): string {
        return r.email;
      },
      extractIdAfter(r: drive_v3.Schema$Permission): string {
        return r.emailAddress!;
      },
      async insert(r: drive_v3.Schema$Permission): Promise<void> {
        configManager.addUser(snakeCase(r.emailAddress!.split('@')[0]!), {
          email: r.emailAddress!,
          role: r.role === 'writer' || r.role === 'owner' ? 'editor' : 'reader',
        });
      },
      async commit() {
        await configManager.save();
      },
    });
  }

  private async _upload() {
    if (this.options.upload.includes('translations')) {
      console.log('TODO: upload translations');
    }

    if (this.options.upload.includes('flavorizations')) {
      console.log('TODO: upload flavorizations');
    }
  }
}
