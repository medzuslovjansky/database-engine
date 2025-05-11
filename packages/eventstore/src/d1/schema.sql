-- Event Store schema for D1 (fast, no revision)
CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stream TEXT NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  ts INTEGER NOT NULL
);

-- Drop table helper (for dev/test only!)
DROP TABLE IF EXISTS Events;
