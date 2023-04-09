import type {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from './types/tables';
import type { SyncRoutineConfig } from './SyncRoutineConfig';
import type { SyncOptions } from './SyncOptions';
import { flavorize } from './utils/flavorize';
import { analyze } from './utils/analyze';
import type { NATURAL_LANGUAGES } from './constants';

export class SyncRoutine {
  private flavorizations: Raw<FlavorizationRecord>[] = [];
  private translations: Raw<TranslationRecord>[] = [];
  private analysis: Record<
    keyof typeof NATURAL_LANGUAGES,
    Raw<AnalysisRecord>[]
  > = {
    be: [],
    bg: [],
    cs: [],
    hr: [],
    mk: [],
    pl: [],
    ru: [],
    sk: [],
    sl: [],
    sr: [],
    uk: [],
  };

  constructor(
    private readonly config: SyncRoutineConfig,
    private readonly options: SyncOptions,
  ) {}

  async run() {
    await this._download();
    await this._flavorize();
    await this._analyze();
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

  private async _upload() {
    if (this.options.upload.includes('translations')) {
      console.log('TODO: upload translations');
    }

    if (this.options.upload.includes('flavorizations')) {
      console.log('TODO: upload flavorizations');
    }
  }
}
