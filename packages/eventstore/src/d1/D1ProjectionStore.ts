import type { D1Database } from '@cloudflare/workers-types';

import type { ProjectionStore } from '../core';

import {
  prepareSelectCheckpoint,
  prepareInsertOrUpdateCheckpoint,
} from './sql';

export class D1ProjectionStore implements ProjectionStore {
  private readonly db: D1Database;
  constructor(db: D1Database) {
    this.db = db;
  }
  async loadCheckpoint(name: string): Promise<number> {
    const row = await prepareSelectCheckpoint(this.db, name).first<{ last_event_id: number }>();
    return row?.last_event_id ?? 0;
  }
  async saveCheckpoint(name: string, lastGlobalEventId: number): Promise<void> {
    await prepareInsertOrUpdateCheckpoint(this.db, name, lastGlobalEventId).run();
  }
}
