import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';
import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { mergeToSynset, toMultiSynset } from '../../google';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';

export type GSheets2GitOptions = GSheetsOpOptions & {
  multisynsets: MultilingualSynsetRepository;
};

export class GSheets2Git extends GSheetsOp {
  private readonly multisynsets: MultilingualSynsetRepository;

  constructor(options: GSheets2GitOptions) {
    super(options);

    this.multisynsets = options.multisynsets;
  }

  protected async delete(id: number): Promise<void> {
    // TODO: think about the future when lemma IDs and synset IDs diverge
    await this.multisynsets.deleteById(id);
  }

  protected async getAfterIds(): Promise<number[]> {
    return this.wordIds();
  }

  protected async getBeforeIds(): Promise<number[]> {
    return this.multisynsets.keys();
  }

  protected async insert(id: number): Promise<void> {
    const multisynset = await this._createSynset(id);
    await this.multisynsets.insert(multisynset);
  }

  protected async update(id: number): Promise<void> {
    const multisynset = await this._createSynset(id);
    await this.multisynsets.upsert(multisynset);
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
