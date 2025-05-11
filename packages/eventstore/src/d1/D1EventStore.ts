import type { D1Database } from '@cloudflare/workers-types';

import type { EventBus, EventEnvelope, EventStore } from '../index';

import {
  prepareInsertEvent,
  prepareSelectStreamFromId,
  prepareSelectAllFromId,
} from './sql';

export interface D1EventStoreConfig {
  db: D1Database;
  eventBus: EventBus;
}

export class D1EventStore implements EventStore {
  private readonly _db: D1Database;
  private readonly _eventBus: EventBus;

  constructor(config: D1EventStoreConfig) {
    this._db = config.db;
    this._eventBus = config.eventBus;
  }

  async append(events: EventEnvelope[]): Promise<void> {
    if (events.length === 0) return;

    const stmts = events.map(event =>
      prepareInsertEvent(
        this._db,
        event.stream,
        event.type,
        event.data,
        event.ts ?? Date.now()
      )
    );

    await this._db.batch(stmts);
    await Promise.all(events.map(event => this._eventBus.publish(event)));
  }

  async *readStream(stream: string, fromId: number = 0): AsyncIterable<EventEnvelope> {
    const result = await prepareSelectStreamFromId(this._db, stream, fromId).all<any>();
    for (const row of result.results) {
      yield this.mapRowToEnvelope(row);
    }
  }

  async *readAll(fromId: number = 0): AsyncIterable<EventEnvelope> {
    const result = await prepareSelectAllFromId(this._db, fromId).all<any>();
    for (const row of result.results) {
      yield this.mapRowToEnvelope(row);
    }
  }

  private mapRowToEnvelope(row: any): EventEnvelope {
    return {
      id: row.id,
      stream: row.stream,
      type: row.type,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      ts: row.ts,
    };
  }
}
