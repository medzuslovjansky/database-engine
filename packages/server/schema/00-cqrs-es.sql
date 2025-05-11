-- CQRS/Event Sourcing primary tables

DROP TABLE IF EXISTS Events;
CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aggregate_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  actor TEXT,
  payload TEXT NOT NULL,
  UNIQUE(aggregate_id, seq)
);

-- Indexes for optimizing read queries
CREATE INDEX idx_events_aggregate_timestamp ON Events(aggregate_id, timestamp);
CREATE INDEX idx_events_type ON Events(type);
CREATE INDEX idx_events_timestamp ON Events(timestamp);

DROP TABLE IF EXISTS Commands;
CREATE TABLE IF NOT EXISTS Commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aggregate_id TEXT,
  type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  actor TEXT,
  executed_at INTEGER,
  status_code INTEGER,
  error_message TEXT,
  result TEXT,
  payload TEXT NOT NULL
);

-- Indexes for optimizing read queries
CREATE INDEX idx_commands_aggregate_created ON Commands(aggregate_id, created_at);
CREATE INDEX idx_commands_type ON Commands(type);
CREATE INDEX idx_commands_status ON Commands(status_code);
CREATE INDEX idx_commands_created ON Commands(created_at);

-- D1 optimization: PRAGMA statements
-- PRAGMA journal_mode = WAL; -- Better for concurrent reads
-- PRAGMA synchronous = NORMAL; -- Better balance of durability and performance
-- PRAGMA cache_size = -64000; -- Use more memory for caching (64MB)
-- PRAGMA temp_store = MEMORY; -- Store temp tables in memory