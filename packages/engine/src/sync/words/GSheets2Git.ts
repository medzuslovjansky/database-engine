import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { mergeToSynset, toMultiSynset } from '../../google';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';

export type GSheets2GitOptions = GSheetsOpOptions;

export class GSheets2Git extends GSheetsOp {
  constructor(options: GSheets2GitOptions) {
    super(options);
  }

  protected async delete(id: number): Promise<void> {
    // TODO: think about the future when lemma IDs and synset IDs diverge
    await this.multisynsets.deleteById(id);
  }

  protected async getAfterIds(): Promise<number[]> {
    const ids = await this.wordIds();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async getBeforeIds(): Promise<number[]> {
    const ids = await this.multisynsets.keys();

    return this.selectedIds
      ? ids.filter((id) => this.selectedIds!.has(id))
      : ids;
  }

  protected async insert(id: number): Promise<void> {
    const multisynset = await this._createSynset(id);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (multisynset.synsets.isv?.verified) {
      await this.multisynsets.insert(multisynset);
    }
  }

  protected async update(id: number): Promise<void> {
    const multisynset = await this._createSynset(id);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (multisynset.synsets.isv?.verified) {
      await this.multisynsets.upsert(multisynset);
    } else {
      await this.multisynsets.deleteById(id);
    }
  }

  private async _createSynset(id: number): Promise<MultilingualSynset> {
    const dto1 = await this.words().then((r) => r.get(id));
    const dto2 = await this.wordsAdd().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto1!);
    if (dto2) {
      mergeToSynset(multisynset, dto2);
    }

    return multisynset;
  }
}
