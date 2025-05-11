import { D1Database } from '@cloudflare/workers-types';
import { UserProjection } from './users';
import { LegacyWordsProjection } from './legacy';
// import { AnotherProjection } from './another/AnotherProjection'; // Example for future

export class Projections {
  private static _instance: Projections | null = null;
  public user: UserProjection;
  public legacyWords: LegacyWordsProjection;
  // public another: AnotherProjection;

  private constructor(db: D1Database) {
    this.user = new UserProjection(db);
    this.legacyWords = new LegacyWordsProjection(db);
    // this.another = new AnotherProjection(db);
  }

  /**
   * Get the singleton instance, initializing if needed (idempotent)
   */
  public static getInstance(db?: D1Database): Projections {
    if (!Projections._instance || (db && Projections._instance.user['db'] !== db)) {
      if (!db) {
        throw new Error('Database instance required for initialization');
      }
      Projections._instance = new Projections(db);
    }
    return Projections._instance;
  }

  /**
   * Return all projection instances as an array
   */
  public getAll(): Array<{ rebuildFromEvents: (clearTable: boolean) => Promise<void> }> {
    return [
      this.user,
      this.legacyWords,
      // this.another,
      // ...add more as you add projections
    ];
  }
}