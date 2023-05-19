import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';
import type { ArrayMapper } from '@interslavic/database-engine-google';
import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { amends } from '../../symbols';
import type { WordsDTO } from '../../google';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';

export type Git2GsheetsOptions = GSheetsOpOptions & {
  readonly fs: MultilingualSynsetRepository;
  readonly selectedIds?: number[];
};

export class Git2Gsheets extends GSheetsOp {
  private readonly fs: MultilingualSynsetRepository;
  private readonly selectedIds?: Set<number>;

  constructor(options: Git2GsheetsOptions) {
    if (!options.beta) throw new Error('Git2Gsheets is only for beta words');

    super({
      ...options,
      beta: true,
    });

    this.fs = options.fs;
    if (options.selectedIds) {
      this.selectedIds = new Set(options.selectedIds);
    }
  }

  protected async getAfterIds(): Promise<number[]> {
    const ids = await this.fs.keys();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async getBeforeIds(): Promise<number[]> {
    const ids = await this._gids();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async insert(id: number): Promise<void> {
    const synset = (await this.fs.findById(id))!;
    const dto = this._synset2dto(synset);
    this.gsheets.batch.appendRows({
      values: [[...dto]],
    });
  }

  protected async update(id: number): Promise<void> {
    /**
     * If this is an amendment, we should append a record with a negative ID.
     * Also, we should reset all the translations in the base record to "-".
     *
     * If this is a beta word, we should just update its row in the spreadsheet.
     */
  }

  protected async delete(id: number): Promise<void> {
    /**
     * If this is an amendment, we should not delete it from the database.
     * We should append a record with isv=! and the same lemma ID with a minus sign.
     * If this is a beta word (with ID < 0), we should delete its row in the spreadsheet.
     */
    const dto = (await this._grecords().then((r) => r.get(id)))!;
    if (dto[amends]) {
      // TODO
    } else {
      // TODO
    }
  }

  private _synset2dto(ms: MultilingualSynset): WordsDTO {
    const Mapper = this.gsheets.Mapper as ArrayMapper<WordsDTO>;
    const isv = ms.synsets.isv!;
    // TODO: this is a violation of synset vs lemma separation
    const steen = isv.lemmas[0]!.steen!;
    const dto: WordsDTO = new Mapper({
      id: -Math.abs(ms.id),
      isv: isv.toString(),
      addition: steen.addition ?? '',
      partOfSpeech: steen.partOfSpeech ?? '',
      type: steen.type ?? '',
      en: `${ms.synsets.en ?? ''}`,
      sameInLanguages: steen.sameInLanguages ?? '',
      genesis: steen.genesis ?? '',
      ru: `${ms.synsets.ru ?? ''}`,
      be: `${ms.synsets.be ?? ''}`,
      uk: `${ms.synsets.uk ?? ''}`,
      pl: `${ms.synsets.pl ?? ''}`,
      cs: `${ms.synsets.cs ?? ''}`,
      sk: `${ms.synsets.sk ?? ''}`,
      bg: `${ms.synsets.bg ?? ''}`,
      mk: `${ms.synsets.mk ?? ''}`,
      sr: `${ms.synsets.sr ?? ''}`,
      hr: `${ms.synsets.hr ?? ''}`,
      sl: `${ms.synsets.sl ?? ''}`,
      cu: `${ms.synsets.cu ?? ''}`,
      de: `${ms.synsets.de ?? ''}`,
      nl: `${ms.synsets.nl ?? ''}`,
      eo: `${ms.synsets.eo ?? ''}`,
      frequency: steen.frequency ?? '',
      intelligibility: '',
      using_example: steen.using_example,
    });
    return dto;
  }
}
