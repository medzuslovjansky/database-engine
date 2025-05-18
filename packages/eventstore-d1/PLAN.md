# D1 Event Store Implementation Plan

## D1 Database Basics

Cloudflare D1 is a serverless SQL database that runs on Cloudflare's edge network. When implementing an event store with D1, we need to focus on:

1. **D1Database Interface**: The main entry point for interacting with D1
2. **Prepared Statements**: For secure and efficient SQL execution
3. **Batch Operations**: For performance when inserting multiple records

## Key D1 Concepts

### D1Database

The `D1Database` interface from `@cloudflare/workers-types` provides methods for:
- `prepare()`: Creates prepared statements
- `exec()`: Executes raw SQL
- `batch()`: Executes multiple prepared statements in a single transaction

### Prepared Statements

Prepared statements help with:
- SQL injection prevention
- Query optimization
- Parameter binding

Example:

# D1 Technical Preparation: Using D1Database, Prepared Statements, and Batch Execution

This section is a quick reference for working with Cloudflare D1 in TypeScript, focusing on the core technicalities you will need for any D1-backed persistence (not just event stores).

## 1. D1Database Interface
- Import from `@cloudflare/workers-types`:
  ```ts
  import type { D1Database } from '@cloudflare/workers-types';
  ```
- The main methods:
  - `prepare(sql: string)`: Returns a `D1PreparedStatement` for parameterized queries.
  - `exec(sql: string | string[])`: Executes raw SQL (for DDL or non-parameterized statements).
  - `batch(statements: D1PreparedStatement[])`: Executes multiple prepared statements in a single transaction.

## 2. Prepared Statements
- Always use `prepare()` for queries and mutations with parameters to prevent SQL injection and improve performance.
- Bind parameters with `.bind(...)`:
  ```ts
  const stmt = db.prepare('SELECT * FROM table WHERE id = ?').bind(id);
  ```
- Execute with:
  - `.run()` for mutations (INSERT/UPDATE/DELETE)
  - `.first<T>()` for a single result
  - `.all<T>()` for all results

## 3. Batch Execution
- For multiple inserts/updates, create an array of prepared statements and execute them in a single transaction:
  ```ts
  const stmts = items.map(item => db.prepare('INSERT ...').bind(...));
  await db.batch(stmts);
  ```
- This is much faster and more reliable than running statements one by one.

## 4. Table Management
- Use `db.exec()` for DDL (CREATE/DROP TABLE):
  ```ts
  await db.exec('CREATE TABLE IF NOT EXISTS ...');
  await db.exec('DROP TABLE IF EXISTS ...');
  ```

## 5. General Tips
- Always serialize complex data (e.g., JSON) before storing, and parse on read.
- Prefer named constants for SQL and table/column names.
- Handle errors gracefully—D1 will throw on SQL errors.




------

# Testing D1 with Miniflare

Testing D1 database interactions requires a special setup since D1 is a Cloudflare-specific service. Here's how to set up a testing environment using Miniflare:

## 1. Setting Up Miniflare for Tests

- Install required dependencies:
  ```bash
  npm install --save-dev miniflare vitest @cloudflare/workers-types
  ```

- Create a minimal worker script (e.g., `worker.js`):
  ```js
  export default {
    async fetch() {
      return new Response('ok');
    }
  };
  ```

- Create a Vitest setup file (e.g., `vitest.setup.ts`):
  ```ts
  import { beforeAll, afterAll } from 'vitest';
  import { Miniflare } from 'miniflare';

  let mf: Miniflare;

  beforeAll(async () => {
    // Initialize Miniflare with an in-memory D1 database
    mf = new Miniflare({
      scriptPath: require.resolve('./worker.js'),
      modules: true,
      d1Databases: { DB: ':memory:' },
    });

    // Get the D1 database instance and make it globally available
    const db = await mf.getD1Database('DB');

    // Initialize your database schema
    const { createEventStoreTables } = await import('./src/tables');
    await createEventStoreTables(db);

    // Make DB available to tests
    globalThis.__MINIFLARE_DB__ = db;
  });

  afterAll(async () => {
    await mf.dispose();
  });
  ```

## 2. Writing D1 Tests

- Configure Vitest to use your setup file in `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      environment: 'node',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  });
  ```

- Create test files that access the D1 database:
  ```ts
  import { createD1EventStoreRoot } from '../src';

  describe('D1EventStore', () => {
    let eventStore: ReturnType<typeof createD1EventStoreRoot>['eventStore'];

    beforeAll(async () => {
      // Access the DB instance created in the setup file
      // @ts-ignore - The global is added at runtime
      const db = globalThis.__MINIFLARE_DB__;
      ({ eventStore } = createD1EventStoreRoot({ db }));
    });

    it('appends and reads back events in order', async () => {
      // Test your D1 operations
      await eventStore.append([
        { stream: 'user-42', type: 'UserRegistered', data: { name: 'Ana' }, ts: Date.now() },
        { stream: 'user-42', type: 'EmailConfirmed', data: {}, ts: Date.now() }
      ]);

      const events = [];
      for await (const ev of eventStore.readStream('user-42')) events.push(ev);

      expect(events.length).toBe(2);
      expect(events[0].type).toBe('UserRegistered');
      expect(events[1].type).toBe('EmailConfirmed');
    });
  });
  ```

## 3. Best Practices for D1 Testing

- Use `:memory:` databases for tests to ensure isolation and speed
- Reset the database state between test runs if needed
- Test both success and error cases for database operations
- Mock external dependencies that aren't directly related to D1
- Use transactions for complex test scenarios to ensure atomicity
- Consider creating helper functions for common test setup and teardown operations

This testing approach allows you to verify your D1 database interactions in an environment that closely mimics the Cloudflare Workers runtime, without requiring an actual Cloudflare account or network connectivity during development and testing.
