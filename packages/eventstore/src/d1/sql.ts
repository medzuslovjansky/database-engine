import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';

export function prepareSelectMaxRevision(db: D1Database, stream: string): D1PreparedStatement {
  return db.prepare('SELECT MAX(revision) as max_rev FROM Events WHERE stream = ?;').bind(stream);
}

export function prepareInsertEvent(db: D1Database, stream: string, type: string, data: unknown, ts: number): D1PreparedStatement {
  return db.prepare('INSERT INTO Events (stream, type, data, ts) VALUES (?, ?, ?, ?);').bind(stream, type, JSON.stringify(data), ts);
}

export function prepareSelectStreamFromId(db: D1Database, stream: string, fromId: number): D1PreparedStatement {
  return db.prepare('SELECT * FROM Events WHERE stream = ? AND id > ? ORDER BY id ASC;').bind(stream, fromId);
}

export function prepareSelectAllFromId(db: D1Database, fromId: number): D1PreparedStatement {
  return db.prepare('SELECT * FROM Events WHERE id > ? ORDER BY id ASC;').bind(fromId);
}

export function prepareSelectCheckpoint(db: D1Database, name: string): D1PreparedStatement {
  return db.prepare('SELECT last_event_id FROM ProjectionCheckpoints WHERE name = ?;').bind(name);
}

export function prepareInsertOrUpdateCheckpoint(db: D1Database, name: string, lastEventId: number): D1PreparedStatement {
  return db.prepare([
    'INSERT INTO ProjectionCheckpoints (name, last_event_id) VALUES (?, ?);',
    'ON CONFLICT(name) DO UPDATE SET last_event_id = excluded.last_event_id;'
  ].join(' ')).bind(name, lastEventId);
}

export async function createEventsTable(db: D1Database): Promise<void> {
  await db.exec([
    'CREATE TABLE IF NOT EXISTS Events (' ,
    'id INTEGER PRIMARY KEY AUTOINCREMENT,',
    'stream TEXT NOT NULL,',
    'type TEXT NOT NULL,',
    'data TEXT NOT NULL,',
    'ts INTEGER NOT NULL',
    ');'
  ].join(' '));
}

export async function createProjectionCheckpointsTable(db: D1Database): Promise<void> {
  await db.exec([
    'CREATE TABLE IF NOT EXISTS ProjectionCheckpoints (',
    'name TEXT PRIMARY KEY,',
    'last_event_id INTEGER NOT NULL',
    ');'
  ].join(' '));
}

export async function dropEventsTable(db: D1Database): Promise<void> {
  await db.exec('DROP TABLE IF EXISTS Events;');
}

export async function dropProjectionCheckpointsTable(db: D1Database): Promise<void> {
  await db.exec('DROP TABLE IF EXISTS ProjectionCheckpoints;');
}
