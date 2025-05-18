import type { D1Database, D1ExecResult } from '@cloudflare/workers-types';
import {
  StreamIdentifier as SID, // Alias to avoid confusion with local vars
  type SnapshotStore,
  type Snapshot,
  type StreamIdentifier,
  type StreamPointer,
} from '@interslavic/database-engine-eventstore';
import type { D1UnitOfWork } from './D1UnitOfWork';

export interface D1SnapshotStoreOptions {
  db: D1Database;
  tableName?: string;
}

const DEFAULT_SNAPSHOTS_TABLE_NAME = 'snapshots';

interface SnapshotDAO {
  stream_prefix: string;
  stream_id: string;
  revision: number;
  ts: number;
  data: string | null; // JSON string or null
}

export class D1SnapshotStore implements SnapshotStore {
  private readonly db: D1Database;
  private readonly tableName: string;

  constructor(options: Readonly<D1SnapshotStoreOptions>) {
    this.db = options.db;
    this.tableName = options.tableName ?? DEFAULT_SNAPSHOTS_TABLE_NAME;
  }

  public static async createTable(
    db: D1Database,
    tableName: string = DEFAULT_SNAPSHOTS_TABLE_NAME,
  ): Promise<D1ExecResult> {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\
stream_prefix TEXT NOT NULL,\
stream_id TEXT NOT NULL,\
revision INTEGER NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT,\
PRIMARY KEY (stream_prefix, stream_id, revision)\
);`;
    return db.exec(sql);
  }

  public static async dropTable(
    db: D1Database,
    tableName: string = DEFAULT_SNAPSHOTS_TABLE_NAME,
  ): Promise<D1ExecResult> {
    const sql = `DROP TABLE IF EXISTS ${tableName}`;
    return db.exec(sql);
  }

  private mapDaoToSnapshot<S>(dao: SnapshotDAO): Snapshot<S> {
    return {
      stream: new SID(dao.stream_prefix, dao.stream_id),
      revision: dao.revision,
      ts: dao.ts,
      data: dao.data ? JSON.parse(dao.data) : undefined,
    } as Snapshot<S>; // Type assertion for S
  }

  async getBatch<S = unknown>(pointers: StreamPointer[]): Promise<Snapshot<S>[]> {
    if (pointers.length === 0) return [];

    const results: Snapshot<S>[] = [];
    for (const pointer of pointers) {
      const stream = typeof pointer.stream === 'string' ? SID.fromString(pointer.stream) : pointer.stream;
      const query = pointer.revision
        ? `SELECT stream_prefix, stream_id, revision, ts, data FROM ${this.tableName} WHERE stream_prefix = ?1 AND stream_id = ?2 AND revision = ?3 LIMIT 1`
        : `SELECT stream_prefix, stream_id, revision, ts, data FROM ${this.tableName} WHERE stream_prefix = ?1 AND stream_id = ?2 ORDER BY revision DESC LIMIT 1`;

      const bindings = pointer.revision ? [stream.prefix, stream.id, pointer.revision] : [stream.prefix, stream.id];
      const stmt = this.db.prepare(query).bind(...bindings);
      const dao = await stmt.first<SnapshotDAO>();
      if (dao) {
        results.push(this.mapDaoToSnapshot<S>(dao));
      }
    }
    return results;
  }

  async getLatest<S = unknown>(streams: StreamIdentifier[]): Promise<Snapshot<S>[]> {
    if (streams.length === 0) return [];
    const pointers: StreamPointer[] = streams.map(s => ({ stream: s }));
    return this.getBatch<S>(pointers); // Leverages getBatch to find the latest (no revision specified)
  }

  /**
   * Stages snapshots for saving by adding their D1PreparedStatements to the provided D1UnitOfWork.
   * The actual commit is handled by the D1UnitOfWork.
   * Uses INSERT OR REPLACE to ensure the latest snapshot for a given revision is stored.
   */
  public stageSnapshots(snapshots: Snapshot[], d1UnitOfWork: D1UnitOfWork): void {
    if (!d1UnitOfWork) {
      throw new Error('A D1UnitOfWork instance is required to stage snapshots.');
    }

    const statements = snapshots.map(snapshot => {
      const query = `
        INSERT OR REPLACE INTO ${this.tableName} (stream_prefix, stream_id, revision, ts, data)
        VALUES (?1, ?2, ?3, ?4, ?5);
      `;
      return this.db.prepare(query).bind(
        snapshot.stream.prefix,
        snapshot.stream.id,
        snapshot.revision,
        snapshot.ts,
        snapshot.data ? JSON.stringify(snapshot.data) : null
      );
    });
    d1UnitOfWork.addStatements(statements);
  }
}
