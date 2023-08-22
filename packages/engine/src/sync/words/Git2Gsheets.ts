import type {
  ArrayMapped,
  ArrayMapper,
  Notes
} from '@interslavic/database-engine-google';
import type { MultilingualSynset } from '@interslavic/database-engine-core';

import type { WordsRecord } from '../../google';
import { log } from '../../utils';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';

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
    this.wordsSheet.batch.appendRows({
      values: [[...dto]],
    });
  }

  protected async update(id: number): Promise<void> {
    const synset = await this.multisynsets.findById(id);
    const dtoNew = this._synset2dto(synset!);
    const gmapWords = await this.words();
    const [dtoOld, notesOld] = gmapWords.get(id)!;

    const startRowIndex = dtoOld.getIndex();
    if (Number.isNaN(startRowIndex)) {
      throw new TypeError(`ID ${id} not found in the spreadsheet`);
    }

    const notes = this._createNotes(dtoOld, notesOld, dtoNew);

    this.wordsSheet.batch.updateRows({
      startRowIndex,
      values: [[...dtoNew]],
      notes: [[...notes] as string[]],
    });
  }

  private _createNotes(
    dtoOld: WordsRecord,
    notesOld: ArrayMapped<Notes<WordsRecord>>,
    dtoNew: WordsRecord,
  ): Notes<WordsRecord> {
    const notes = notesOld.getCopy();
    if (dtoOld.isv !== dtoNew.isv) {
      notes.isv ??= dtoOld.isv;
    }
    if (dtoOld.addition !== dtoNew.addition) {
      notes.addition ??= dtoOld.addition;
    }
    if (dtoOld.partOfSpeech !== dtoNew.partOfSpeech) {
      notes.partOfSpeech ??= dtoOld.partOfSpeech;
    }
    if (dtoOld.type != dtoNew.type) {
      notes.type ??= `${dtoOld.type}`;
    }
    if (dtoOld.en !== dtoNew.en) {
      notes.en ??= dtoOld.en;
    }
    if (dtoOld.sameInLanguages !== dtoNew.sameInLanguages) {
      notes.sameInLanguages ??= dtoOld.sameInLanguages;
    }
    if (dtoOld.genesis !== dtoNew.genesis) {
      notes.genesis ??= dtoOld.genesis;
    }
    return notes;
  }

  protected async delete(id: number): Promise<void> {
    const [dto] = (await this.words().then((r) => r.get(id)))!;
    if (!dto.isv.startsWith('!')) {
      dto.isv = '!' + dto.isv;
    }

    this.wordsSheet.batch.updateRows({
      startRowIndex: dto.getIndex(),
      startColumnIndex: dto.getColumnIndex('isv'),
      values: [[dto.isv]],
    });
  }

  protected async commit(): Promise<void> {
    const data = (this.wordsSheet.batch as any).requests;
    await log.trace.complete({ cat: ['gsheets'], data }, 'batch update', () =>
      this.wordsSheet.batch.flush(),
    );
  }

  private _synset2dto(ms: MultilingualSynset): ArrayMapped<WordsRecord> {
    const Mapper = this.wordsSheet.Mapper as ArrayMapper<WordsRecord>;
    const isv = ms.synsets.isv!;
    // TODO: this is a violation of synset vs lemma separation
    const steen = isv.lemmas[0]!.steen!;
    const dto: ArrayMapped<WordsRecord> = new Mapper({
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
      using_example: steen.using_example ?? '',
    });

    for (const key of ms.steen?.debated ?? []) {
      dto[key] = `#${dto[key]}`;
    }

    return dto;
  }
}
