import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import { toMultiSynset } from '../../google';

import type { GSheetsOpOptions } from './GSheetsOp';
import { GSheetsOp } from './GSheetsOp';

export type GSheets2GitOptions = GSheetsOpOptions & {
  fs: MultilingualSynsetRepository;
};

export class GSheets2Git extends GSheetsOp {
  private readonly fs: MultilingualSynsetRepository;

  constructor(options: GSheets2GitOptions) {
    super(options);

    this.fs = options.fs;
  }

  protected async delete(id: number): Promise<void> {
    // TODO: think about the future when lemma IDs and synset IDs diverge
    await this.fs.deleteById(id);
  }

  protected async getAfterIds(): Promise<number[]> {
    return this._gids();
  }

  protected async getBeforeIds(): Promise<number[]> {
    return this.fs.keys();
  }

  protected async insert(id: number): Promise<void> {
    const dto = await this._grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.insert(multisynset);
  }

  protected async update(id: number): Promise<void> {
    const dto = await this._grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.upsert(multisynset);
  }
}
