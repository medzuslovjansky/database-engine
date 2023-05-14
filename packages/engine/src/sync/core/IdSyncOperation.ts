/* eslint-disable @typescript-eslint/no-empty-function */
import { difference, intersection } from 'lodash';

export abstract class IdSyncOperation<ID = string> {
  protected abstract getBeforeIds(): Promise<ID[]>;
  protected abstract getAfterIds(): Promise<ID[]>;

  protected abstract insert(id: ID): Promise<void>;
  protected abstract update(id: ID): Promise<void>;
  protected abstract delete(id: ID): Promise<void>;

  protected async beginTransaction(): Promise<void> {}
  protected async rollbackTransaction(): Promise<void> {}
  protected async commit(): Promise<void> {}

  async execute(): Promise<void> {
    await this.beginTransaction?.();

    try {
      const [beforeIds, afterIds] = await Promise.all([
        this.getBeforeIds(),
        this.getAfterIds(),
      ]);

      await Promise.all([
        ...difference(beforeIds, afterIds).map((id) => this.delete(id)),
        ...intersection(beforeIds, afterIds).map((id) => this.update(id)),
        ...difference(afterIds, beforeIds).map((id) => this.insert(id)),
      ]);

      await this.commit?.();
    } catch (error) {
      await this.rollbackTransaction?.();
      throw error;
    }
  }
}
