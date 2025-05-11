import { D1Database } from '@cloudflare/workers-types';
import type { Event } from '@app/schema';
import type { EventName } from '@app/schema/events/registry';
import type { TypedEvent } from '@app/schema/system/event';
import { EventBus } from '@app/events/bus';

/**
 * Base abstract class for projections that handle events
 */
export abstract class Projection {
  protected db: D1Database;

  /**
   * Create a new projection
   * @param db D1 database instance
   */
  constructor(db: D1Database) {
    this.db = db;
    this.registerHandlers();
  }

  /**
   * Register event handlers for this projection
   * Override in subclasses to subscribe to specific event types
   */
  protected abstract registerHandlers(): void;

  /**
   * Helper method to subscribe to an event type
   * @param eventType Event type to subscribe to
   * @param handler Handler function to process the event
   */
  protected subscribe<K extends EventName>(eventType: K, handler: (event: TypedEvent<K>) => Promise<void>): void {
    // Type cast is safe because we control the event bus and event creation
    EventBus.getInstance().subscribe(eventType, handler as any);
  }

  /**
   * Rebuild state from all events in the database
   * @param clearTable If true, clears the target table before rebuilding
   */
  async rebuildFromEvents(clearTable: boolean = false): Promise<void> {
    if (clearTable) {
      await this.clearTable();
    }

    // Process all events in order
    const events = await this.db
      .prepare('SELECT * FROM Events ORDER BY id ASC')
      .all<Event>();

    // Parse payloads before processing
    const parsedEvents = events.results.map(event => ({
      ...event,
      payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload,
    }));

    const bus = EventBus.getInstance();
    // Temporarily disable immediate processing to avoid double processing
    const wasImmediate = bus.setImmediateProcessing(false);

    try {
      for (const event of parsedEvents) {
        await bus.processEvent(event);
      }
    } finally {
      // Restore previous mode
      bus.setImmediateProcessing(wasImmediate);
    }
  }

  /**
   * Clear the projected table (override in subclasses)
   */
  protected async clearTable(): Promise<void> {
    // Implement in subclasses, e.g.:
    // await this.db.exec('DELETE FROM table_name');
  }
}
