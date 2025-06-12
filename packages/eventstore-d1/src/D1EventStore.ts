import type { D1Database, D1ExecResult, D1Result } from '@cloudflare/workers-types';
import {
  StreamIdentifier,
  type EventStore,
  type CommittedEvent,
  type Event,
  type StreamPointer,
} from '@interslavic/database-engine-eventstore';

import type { D1UnitOfWork } from './D1UnitOfWork';

export interface D1EventStoreOptions {
  db: D1Database;
  tableName?: string;
  batchSize?: number;
}

const DEFAULT_EVENTS_TABLE_NAME = 'Events';

// Data Access Object type for events from D1
interface CommittedEventDAO {
  id: number;
  stream: string;
  revision: number;
  type: string;
  ts: number;
  data: string | null; // JSON string or null
}

// TODO: DDL this, add indices

export class D1EventStore implements EventStore {
  private readonly db: D1Database;
  private readonly tableName: string;
  private readonly batchSize: number;

  constructor(options: Readonly<D1EventStoreOptions>) {
    this.db = options.db;
    this.tableName = options.tableName ?? DEFAULT_EVENTS_TABLE_NAME;
    this.batchSize = options.batchSize ?? 50;
  }

  public static async createTable(
    db: D1Database,
    tableName: string = DEFAULT_EVENTS_TABLE_NAME,
  ): Promise<D1ExecResult> {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
stream TEXT NOT NULL,\
revision INTEGER NOT NULL,\
type TEXT NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT,\
UNIQUE (stream, revision)\
);`;
    return db.exec(sql);
  }

  public static async dropTable(
    db: D1Database,
    tableName: string = DEFAULT_EVENTS_TABLE_NAME,
  ): Promise<D1ExecResult> {
    const sql = `DROP TABLE IF EXISTS ${tableName}`;
    return db.exec(sql);
  }

  // Helper to map raw DB result to CommittedEvent
  private mapDaoToCommittedEvent(dao: CommittedEventDAO): CommittedEvent {
    return {
      id: dao.id,
      stream: StreamIdentifier.fromString(dao.stream),
      revision: dao.revision,
      type: dao.type,
      ts: dao.ts,
      data: dao.data,
    };
  }

  async *readStream(pointer: StreamPointer): AsyncIterable<CommittedEvent[]> {
    const stream = typeof pointer.stream === 'string' ? pointer.stream : pointer.stream.toString();
    const revision = pointer.revision ?? 0;
    const batchSize = this.batchSize;
    let lastRevision = revision;
    while (true) {
      const query = `
        SELECT id, stream, revision, type, ts, data
        FROM ${this.tableName}
        WHERE stream = ?1 AND revision > ?2
        ORDER BY revision ASC
        LIMIT ?3;
      `;
      const stmt = this.db.prepare(query).bind(stream, lastRevision, batchSize);
      const d1Result: D1Result<CommittedEventDAO> = await stmt.all();
      const events = d1Result.results?.map(this.mapDaoToCommittedEvent.bind(this)) ?? [];
      if (events.length > 0) {
        lastRevision = events.at(-1)!.revision;
        yield events;
      }
      if (events.length < batchSize) {
        break;
      }
    }
  }

  async *readStreams(pointers: StreamPointer[]): AsyncIterableIterator<CommittedEvent[]> {
    if (pointers.length === 0) {
      return;
    }
    for (const pointer of pointers) {
      const streamEvents: CommittedEvent[] = [];
      for await (const batch of this.readStream(pointer)) {
        streamEvents.push(...batch);
      }
      if (streamEvents.length > 0) {
        yield streamEvents;
      }
    }
  }

  async *readAll(fromId = 0): AsyncIterable<CommittedEvent[]> {
    const batchSize = this.batchSize;
    let lastSeenId = fromId;
    while (true) {
      const query = `
        SELECT id, stream, revision, type, ts, data
        FROM ${this.tableName}
        WHERE id > ?1
        ORDER BY id ASC
        LIMIT ?2;
      `;
      const stmt = this.db.prepare(query).bind(lastSeenId, batchSize);
      const d1Result: D1Result<CommittedEventDAO> = await stmt.all();
      const events = d1Result.results?.map(this.mapDaoToCommittedEvent.bind(this)) ?? [];
      if (events.length === 0) {
        break;
      }
      yield events;
      lastSeenId = events.at(-1)!.id;
      if (events.length < batchSize) {
        break;
      }
    }
  }

  /**
   * Appends events by adding their corresponding D1PreparedStatements to the provided D1UnitOfWork.
   * The actual commit is handled by the D1UnitOfWork.
   */
  public append(events: Event[], d1UnitOfWork: D1UnitOfWork): void {
    if (!d1UnitOfWork) {
      throw new Error('A D1UnitOfWork instance is required to append events.');
    }
    const statements = events.map(event => {
      const query = `
        INSERT INTO ${this.tableName} (stream, revision, type, ts, data)
        VALUES (?1, ?2, ?3, ?4, ?5);
      `;
      return this.db.prepare(query).bind(
        String(event.stream),
        event.revision,
        event.type,
        event.ts,
        event.data ? JSON.stringify(event.data) : null
      );
    });
    d1UnitOfWork.addStatements(statements);
  }
}
