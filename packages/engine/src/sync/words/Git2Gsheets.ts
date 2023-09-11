import type { ArrayMapper } from '@interslavic/database-engine-google';
import type { MultilingualSynset } from '@interslavic/database-engine-core';
import { isEqual, isUndefined } from 'lodash';

import type {
  WordsAddLangDTO,
  WordsAddLangRecord,
  WordsDTO,
  WordsRecord,
} from '../../google';
import { log } from '../../utils';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';
import { isBeta } from './utils';

export type Git2GsheetsOptions = GSheetsOpOptions;

export class Git2Gsheets extends GSheetsOp {
  constructor(options: Git2GsheetsOptions) {
    super(options);

    if (!options.beta) {
      throw new Error('Git2Gsheets is only for beta words');
    }
  }

  protected async getAfterIds(): Promise<number[]> {
    const ids = await this.multisynsets.keys();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async getBeforeIds(): Promise<number[]> {
    const ids = await this.wordIds();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async insert(id: number): Promise<void> {
    const synset = await this.multisynsets.findById(id);
    const dto = this._synset2dto(synset!);
    const dtoAddLang = this._synset2dtoAddLang(synset!);

    this.wordsSheet.batch.appendRows({
      values: [[...dto]],
    });

    this.wordsAddLangSheet.batch.appendRows({
      values: [[...dtoAddLang]],
    });
  }

  protected async update(id: number): Promise<void> {
    if (await this._updateWords(id)) {
      await this._updateWordsAddLang(id);
    }
  }

  protected async delete(id: number): Promise<void> {
    await this._deleteWords(id);
    await this._deleteWordsAddLang(id);
  }

  protected async rollbackTransaction(): Promise<void> {
    this.wordsSheet.batch.clear();
    this.wordsAddLangSheet.batch.clear();
  }

  protected async commit(): Promise<void> {
    const data = (this.wordsSheet.batch as any).requests;
    console.log('Sending %i request(s) in batch...', data.length);

    await log.trace.complete(
      { cat: ['gsheets'], data },
      'batch update',
      async () => {
        await this.wordsSheet.batch.flush();
        await this.wordsAddLangSheet.batch.flush();
      },
    );
  }

  private _synset2dto(ms: MultilingualSynset): WordsDTO {
    const Mapper = this.wordsSheet.Mapper as ArrayMapper<WordsRecord>;
    const isv = ms.synsets.isv!;
    // TODO: this is a violation of synset vs lemma separation
    const steen = isv.lemmas[0]!.steen!;

    const dto: WordsDTO = new Mapper({
      id: isBeta(ms) ? -ms.id : ms.id,
      isv: isv.toString(),
      addition: steen.addition ?? '',
      partOfSpeech: steen.partOfSpeech ?? '',
      type: steen.type ?? '',
      en: `${ms.synsets.en ?? ''}`,
      sameInLanguages: steen.sameInLanguages ?? '',
      genesis: steen.genesis ?? '',
      ru: `${ms.synsets.ru ?? '!'}`,
      be: `${ms.synsets.be ?? '!'}`,
      uk: `${ms.synsets.uk ?? '!'}`,
      pl: `${ms.synsets.pl ?? '!'}`,
      cs: `${ms.synsets.cs ?? '!'}`,
      sk: `${ms.synsets.sk ?? '!'}`,
      bg: `${ms.synsets.bg ?? '!'}`,
      mk: `${ms.synsets.mk ?? '!'}`,
      sr: `${ms.synsets.sr ?? '!'}`,
      hr: `${ms.synsets.hr ?? '!'}`,
      sl: `${ms.synsets.sl ?? '!'}`,
      cu: `${ms.synsets.cu ?? '!'}`,
      de: `${ms.synsets.de ?? '!'}`,
      nl: `${ms.synsets.nl ?? '!'}`,
      eo: `${ms.synsets.eo ?? '!'}`,
      frequency: steen.frequency ?? '',
      intelligibility: '',
      using_example: steen.using_example ?? '',
    });

    for (const key of ms.steen?.debated ?? []) {
      dto[key] = `#${dto[key]}`;
    }

    return dto;
  }

  private _synset2dtoAddLang(ms: MultilingualSynset): WordsAddLangDTO {
    const Mapper = this.wordsAddLangSheet
      .Mapper as ArrayMapper<WordsAddLangRecord>;
    const isv = ms.synsets.isv!;
    // TODO: this is a violation of synset vs lemma separation
    const steen = isv.lemmas[0]!.steen!;
    const dto: WordsAddLangDTO = new Mapper({
      id: isBeta(ms) ? -ms.id : ms.id,
      isv: isv.toString(),
      addition: steen.addition ?? '',
      partOfSpeech: steen.partOfSpeech ?? '',
      type: steen.type ?? '',
      en: `${ms.synsets.en ?? ''}`,
      sameInLanguages: steen.sameInLanguages ?? '',
      genesis: steen.genesis ?? '',
      ru: `${ms.synsets.ru ?? '!'}`,
      pl: `${ms.synsets.pl ?? '!'}`,
      cs: `${ms.synsets.cs ?? '!'}`,
      de: `${ms.synsets.de ?? '!'}`,
      csb: `${ms.synsets.csb ?? '!'}`,
      dsb: `${ms.synsets.dsb ?? '!'}`,
      hsb: `${ms.synsets.hsb ?? '!'}`,
      ia: `${ms.synsets.ia ?? '!'}`,
      es: `${ms.synsets.es ?? '!'}`,
      pt: `${ms.synsets.pt ?? '!'}`,
      fr: `${ms.synsets.fr ?? '!'}`,
      it: `${ms.synsets.it ?? '!'}`,
      he: `${ms.synsets.he ?? '!'}`,
      da: `${ms.synsets.da ?? '!'}`,
    });

    return dto;
  }

  private _hasChangesWords(
    dtoOld: WordsDTO | WordsAddLangDTO,
    dtoNew: WordsDTO | WordsAddLangDTO,
  ): boolean {
    const $old = dtoOld.getSlice('isv').map(asString);
    const $new = dtoNew.getSlice('isv').map(asString);
    return !isEqual($old, $new);
  }

  private async _deleteWords(id: number): Promise<void> {
    const dto = (await this.words().then((r) => r.get(id)))!;
    if (!dto.isv.startsWith('!')) {
      dto.isv = '!' + dto.isv;

      this.wordsSheet.batch.updateRows({
        startRowIndex: dto.getIndex() + 1,
        startColumnIndex: dto.getColumnIndex('isv'),
        values: [[dto.isv]],
      });
    }
  }

  private async _deleteWordsAddLang(id: number): Promise<void> {
    const dto = (await this.wordsAdd().then((r) => r.get(id)))!;
    if (!dto.isv.startsWith('!')) {
      dto.isv = '!' + dto.isv;
    }

    this.wordsAddLangSheet.batch.updateRows({
      startRowIndex: dto.getIndex() + 1,
      startColumnIndex: dto.getColumnIndex('isv'),
      values: [[dto.isv]],
    });
  }

  private async _updateWords(id: number): Promise<boolean> {
    const synset = await this.multisynsets.findById(id);
    const dtoNew = this._synset2dto(synset!);
    const gmapWords = await this.words();
    const dtoOld = gmapWords.get(id)!;
    dtoNew.frequency = dtoOld.frequency ??= '';
    dtoNew.intelligibility = dtoOld.intelligibility ??= '';
    dtoNew.using_example = dtoOld.using_example ??= '';

    const startRowIndex = dtoOld.getIndex() + 1;
    if (Number.isNaN(startRowIndex)) {
      throw new TypeError(`ID ${id} not found in the spreadsheet`);
    }

    if (!this._hasChangesWords(dtoOld, dtoNew)) {
      return false;
    }

    let notes = isBeta(dtoOld)
      ? undefined
      : [[...this._annotate(dtoOld, dtoNew)] as string[]];

    if (notes && notes[0].every(isUndefined)) {
      notes = undefined;
    }

    dtoNew.intelligibility = asString(dtoNew.intelligibility);
    dtoNew.using_example = asString(dtoNew.using_example);

    this.wordsSheet.batch.updateRows({
      startRowIndex,
      values: [[...dtoNew]],
      notes,
    });

    return true;
  }

  private async _updateWordsAddLang(id: number): Promise<void> {
    const gmapWords = await this.wordsAdd();
    const synset = await this.multisynsets.findById(id);
    const dtoOld = gmapWords.get(id);
    const dtoNew = this._synset2dtoAddLang(synset!);

    if (dtoOld) {
      if (this._hasChangesWords(dtoOld, dtoNew)) {
        const startRowIndex = dtoOld.getIndex() + 1;
        this.wordsAddLangSheet.batch.updateRows({
          startRowIndex,
          values: [[...dtoNew]],
        });
      }
    } else {
      this.wordsAddLangSheet.batch.appendRows({
        values: [[...dtoNew]],
      });
    }
  }

  private _annotate(dtoOld: WordsDTO, dtoNew: WordsDTO) {
    const keys = [
      'isv',
      'addition',
      'partOfSpeech',
      'type',
      'en',
      'sameInLanguages',
    ] as const;

    const notes = dtoOld.getNotes()!.getCopy();
    for (const key of keys) {
      const sOld = asString(dtoOld[key]);
      const sNew = asString(dtoNew[key]);

      if (sOld && sOld !== sNew) {
        notes[key] ??= sOld;
        if (notes[key] === sNew) {
          notes[key] = undefined;
        } else if (!sNew.startsWith('#')) {
          dtoNew[key] = `#${sNew}`;
        }
      }
    }

    return notes;
  }
}

function asString(x: unknown) {
  return `${x ?? ''}`.trim();
}
