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
}

const DEFAULT_EVENTS_TABLE_NAME = 'events';

// Data Access Object type for events from D1
interface CommittedEventDAO {
  id: number;
  stream_prefix: string;
  stream_id: string;
  revision: number;
  type: string;
  ts: number;
  data: string | null; // JSON string or null
}

export class D1EventStore implements EventStore {
  private readonly db: D1Database;
  private readonly tableName: string;

  constructor(options: Readonly<D1EventStoreOptions>) {
    this.db = options.db;
    this.tableName = options.tableName ?? DEFAULT_EVENTS_TABLE_NAME;
  }

  public static async createTable(
    db: D1Database,
    tableName: string = DEFAULT_EVENTS_TABLE_NAME,
  ): Promise<D1ExecResult> {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
stream_prefix TEXT NOT NULL,\
stream_id TEXT NOT NULL,\
revision INTEGER NOT NULL,\
type TEXT NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT,\
UNIQUE (stream_prefix, stream_id, revision)\
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
      stream: new StreamIdentifier(dao.stream_prefix, dao.stream_id),
      revision: dao.revision,
      type: dao.type,
      ts: dao.ts,
      data: dao.data ? JSON.parse(dao.data) : undefined,
    };
  }

  async *readStream(pointer: StreamPointer): AsyncIterable<CommittedEvent[]> {
    const stream = typeof pointer.stream === 'string' ? StreamIdentifier.fromString(pointer.stream) : pointer.stream;
    const revision = pointer.revision ?? 0;

    const query = `
      SELECT id, stream_prefix, stream_id, revision, type, ts, data
      FROM ${this.tableName}
      WHERE stream_prefix = ?1 AND stream_id = ?2 AND revision > ?3
      ORDER BY revision ASC;
    `;

    const stmt = this.db.prepare(query).bind(stream.prefix, stream.id, revision);
    const d1Result: D1Result<CommittedEventDAO> = await stmt.all();

    if (d1Result.results) {
      yield d1Result.results.map(this.mapDaoToCommittedEvent.bind(this));
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

  async *readAll(fromId?: number): AsyncIterable<CommittedEvent[]> {
    const BATCH_SIZE = 100;
    let lastSeenId = fromId ?? 0;

    while (true) {
      const query = `
        SELECT id, stream_prefix, stream_id, revision, type, ts, data
        FROM ${this.tableName}
        WHERE id > ?1
        ORDER BY id ASC
        LIMIT ?2;
      `;
      const stmt = this.db.prepare(query).bind(lastSeenId, BATCH_SIZE);
      const d1Result: D1Result<CommittedEventDAO> = await stmt.all();

      const events = d1Result.results?.map(this.mapDaoToCommittedEvent.bind(this)) ?? [];
      if (events.length === 0) {
        break;
      }

      yield events;
      lastSeenId = events[events.length - 1].id!;

      if (events.length < BATCH_SIZE) {
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
        INSERT INTO ${this.tableName} (stream_prefix, stream_id, revision, type, ts, data)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6);
      `;
      return this.db.prepare(query).bind(
        event.stream.prefix,
        event.stream.id,
        event.revision,
        event.type,
        event.ts,
        event.data ? JSON.stringify(event.data) : null
      );
    });
    d1UnitOfWork.addStatements(statements);
  }
}
