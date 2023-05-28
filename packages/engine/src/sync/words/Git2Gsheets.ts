import type { ArrayMapper } from '@interslavic/database-engine-google';
import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { amends, beta } from '../../symbols';
import type { WordsDTO } from '../../google';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';
import { isRestrictedEdit } from './isRestrictedEdit';

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
    const dto = this._synset2dto(synset!);
    const gmap = await this.words();
    const existing: WordsDTO = gmap.get(id)!;
    const startRowIndex = existing.getIndex() + 1;
    if (Number.isNaN(startRowIndex)) {
      throw new TypeError(`ID ${id} not found in the spreadsheet`);
    }

    if (existing[beta]) {
      /* If this is a beta word, we should just update its row in the spreadsheet. */
      this.wordsSheet.batch.updateRows({
        startRowIndex,
        values: [[...dto]],
      });
    } else if (isRestrictedEdit(existing, dto)) {
      /* If this is a heavy edit, we should append a new row with the new data. */
      /* Also, we should "reset" the translations in the old row. */
      this.wordsSheet.batch
        .appendRows({
          values: [[...dto]],
        })
        .updateRows({
          startRowIndex,
          startColumnIndex: this.ruIndex,
          values: [dto.getSlice('ru', 'frequency').fill('-')],
        });
    } else {
      /* Light edits just change the translations */
      this.wordsSheet.batch.updateRows({
        startRowIndex,
        startColumnIndex: this.ruIndex,
        values: [dto.getSlice('ru', 'frequency')],
      });
    }
  }

  protected async delete(id: number): Promise<void> {
    const dto = (await this.words().then((r) => r.get(id)))!;
    if (dto[beta] && !dto[amends]) {
      this.wordsSheet.batch.deleteRows({
        startRowIndex: dto.getIndex(),
      });
    } else {
      const copy = Object.assign(dto.getCopy(), {
        id: -Math.abs(+dto.id),
        isv: '!' + dto.isv,
        ru: '-',
        be: '-',
        uk: '-',
        pl: '-',
        cs: '-',
        sk: '-',
        bg: '-',
        mk: '-',
        sr: '-',
        hr: '-',
        sl: '-',
        cu: '-',
        de: '-',
        nl: '-',
        eo: '-',
      });

      this.wordsSheet.batch.appendRows({
        values: [[...copy]],
      });
    }
  }

  protected async commit(): Promise<void> {
    await this.wordsSheet.batch.flush();
  }

  private __ruIndex?: number;
  private get ruIndex(): number {
    if (this.__ruIndex === undefined) {
      this.__ruIndex = this.wordsSheet.Mapper!.getColumnIndex('ru')!;
    }

    return this.__ruIndex;
  }

  private _synset2dto(ms: MultilingualSynset): WordsDTO {
    const Mapper = this.wordsSheet.Mapper as ArrayMapper<WordsDTO>;
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
      using_example: steen.using_example ?? '',
    });

    for (const key of ms.steen?.debated ?? []) {
      dto[key] = `#${dto[key]}`;
    }

    return dto;
  }
}
