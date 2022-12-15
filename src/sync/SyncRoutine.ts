import type { SyncRoutineConfig } from './SyncRoutineConfig';
import type { SyncOptions } from './SyncOptions';
import { FlavorizationRecord, Raw, TranslationRecord } from '../types/tables';
import { flavorize } from './utils/flavorize';
import { analyze } from './utils/analyze';

export class SyncRoutine {
  private flavorizations: Raw<FlavorizationRecord>[] = [];
  private translations: Raw<TranslationRecord>[] = [];

  constructor(
    private readonly config: SyncRoutineConfig,
    private readonly options: SyncOptions,
  ) {}

  async run() {
    await this._download();

    this.translations = await this.config.sheetsCache.getTranslations();
    this.flavorizations = await this.config.sheetsCache.getFlavorizations();

    await this._flavorize();
    await this._analyze();
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
  }

  private async _flavorize() {
    if (this.options.flavorize.length === 0) {
      return;
    }

    const sheetsCache = this.config.sheetsCache;
    this.flavorizations = [
      ...flavorize(this.translations, this.flavorizations, {
        langs: this.options.flavorize,
        forceUpdate: true,
      }),
    ];

    await sheetsCache.writeSheet('flavorizations', this.flavorizations);
  }

  private async _analyze() {
    if (this.options.analyze.length === 0) {
      return;
    }

    const sheetsCache = this.config.sheetsCache;
    const langs = this.options.analyze;

    for (const lang of langs) {
      const analysis = await sheetsCache.getAnalysis(lang);

      await sheetsCache.writeSheet(lang, [
        ...analyze(this.translations, this.flavorizations, analysis, lang),
      ]);
    }
  }

  private async _setPermissions() {
    if (!this.options.setPermissions) {
      return;
    }

    // TODO
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
