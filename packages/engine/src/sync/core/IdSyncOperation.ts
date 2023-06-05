/* eslint-disable @typescript-eslint/no-empty-function */
import { difference, intersection } from 'lodash';

import { log } from '../../utils';

const GET_BEFORE = ['get-before'];
const GET_AFTER = ['get-after'];
const COMMIT = ['commit'];
const ROLLBACK = ['rollback'];

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
        log.trace.complete(
          { cat: GET_BEFORE, tid: ['sync', 'before'] },
          'get-before',
          this.getBeforeIds(),
        ),
        log.trace.complete(
          { cat: GET_AFTER, tid: ['sync', 'after'] },
          'get-after',
          this.getAfterIds(),
        ),
      ]);

      await Promise.all(
        intersection(beforeIds, afterIds).map((id) => this.update(id)),
      );
      await Promise.all(
        difference(beforeIds, afterIds).map((id) => this.delete(id)),
      );
      await Promise.all(
        difference(afterIds, beforeIds).map((id) => this.insert(id)),
      );

      await log.trace.complete({ cat: COMMIT }, 'commit', this.commit?.());
    } catch (error) {
      await log.trace.complete(
        { cat: ROLLBACK, err: error },
        'rollback',
        this.rollbackTransaction?.(),
      );
      throw error;
    }
  }
}
