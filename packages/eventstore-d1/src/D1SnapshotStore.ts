import type { D1Database, D1ExecResult } from '@cloudflare/workers-types';
import {
  StreamIdentifier,
  type SnapshotStore,
  type Snapshot,
  type StreamPointer,
} from '@interslavic/database-engine-eventstore';

import type { D1UnitOfWork } from './D1UnitOfWork';

export interface D1SnapshotStoreOptions {
  db: D1Database;
  tableName?: string;
}

const DEFAULT_SNAPSHOTS_TABLE_NAME = 'Snapshots';

interface SnapshotDAO {
  stream: string;
  revision: number;
  ts: number;
  data: string;
}

// TODO: DDL this, add indices

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
stream TEXT PRIMARY KEY,\
revision INTEGER NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT NOT NULL\
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
      stream: StreamIdentifier.fromString(dao.stream),
      revision: dao.revision,
      ts: dao.ts,
      data: JSON.parse(dao.data),
    } as Snapshot<S>; // Type assertion for S
  }

  async getBatch<S = unknown>(pointers: StreamPointer[]): Promise<Snapshot<S>[]> {
    if (pointers.length === 0) return [];

    // Prepare all select statements for the batch
    const statements = pointers.map(pointer => {
      const stream = String(pointer.stream);
      const query = pointer.revision
        ? `SELECT stream, revision, ts, data FROM ${this.tableName} WHERE stream = ?1 AND revision = ?2 LIMIT 1`
        : `SELECT stream, revision, ts, data FROM ${this.tableName} WHERE stream = ?1 ORDER BY revision DESC LIMIT 1`;
      const bindings = pointer.revision ? [stream, pointer.revision] : [stream];
      return this.db.prepare(query).bind(...bindings);
    });

    // Execute all statements in a single batch (atomic)
    const batchResults = await this.db.batch(statements);

    // Each result is a D1Result; get the first row if present
    const snapshots: Snapshot<S>[] = batchResults.map((result: any) => {
      const dao = result.results?.[0];
      return dao ? this.mapDaoToSnapshot<S>(dao) : undefined;
    }).filter(Boolean) as Snapshot<S>[];

    return snapshots;
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
        INSERT INTO ${this.tableName} (stream, revision, ts, data)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(stream) DO UPDATE SET
          revision = excluded.revision,
          ts = excluded.ts,
          data = excluded.data
        WHERE excluded.revision > ${this.tableName}.revision;
      `;
      return this.db.prepare(query).bind(
        String(snapshot.stream),
        snapshot.revision,
        snapshot.ts,
        JSON.stringify(snapshot.data)
      );
    });
    d1UnitOfWork.addStatements(statements);
  }
}
