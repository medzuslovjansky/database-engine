/**
 * Base command interfaces and abstract classes
 */
import { D1Database } from '@cloudflare/workers-types';
import type { User } from '@app/auth';
import { EventBus } from '@app/events';
import type { Event, EventEntry, EventName, TypedEvent } from '@app/schema';
import { commandRegistry, CommandEntry, CommandPayload } from '@app/schema';

export interface BaseCommandConfig<CN extends keyof typeof commandRegistry> {
  db: D1Database;
  user?: User | null;
}

/**
 * Interface for a command
 */
export interface ICommand<TPayload, TResult> {
  /**
   * Execute the command with the given payload
   * @param payload Command payload
   * @returns Command result
   */
  execute(payload: TPayload): Promise<TResult>;
}

/**
 * Abstract base class for commands
 */
export abstract class BaseCommand<CN extends keyof typeof commandRegistry, TResult> implements ICommand<CommandPayload<CN>, TResult> {
  protected commandEntry: CommandEntry<CN>;
  protected db: D1Database;
  protected user: User | null = null;

  /**
   * Create a new command instance
   * @param config Command configuration
   */
  constructor(commandEntry: CommandEntry<CN>, config: BaseCommandConfig<CN>) {
    this.commandEntry = commandEntry;
    this.db = config.db;
    this.user = config.user || null;
  }

  /**
   * Execute the command with the given payload
   * @param payload Command payload
   * @returns Command result
   */
  public async execute(payload: CommandPayload<CN>): Promise<TResult> {
    const parseResult = this.commandEntry.schema.safeParse(payload);
    if (!parseResult.success) {
      await this.recordCommand(this.commandEntry, null, payload, undefined, parseResult.error);
      throw parseResult.error;
    }

    try {
      const result = await this.doExecute(parseResult.data);
			if (result) {
				await this.recordCommand(this.commandEntry, null, payload, result, undefined);
			}

      return result;
    } catch (error) {
      await this.recordCommand(this.commandEntry, null, payload, undefined, error);
      throw error;
    }
  }

  /**
   * Record command in the Commands table
   * @param entry Command entry
   * @param aggregateId Target aggregate ID (if applicable)
   * @param payload Command payload
   * @param result Command result (if successful)
   * @param errorMessage Error message (if failed)
   */
  protected async recordCommand<CE extends CommandEntry>(
    entry: CE,
    aggregateId: string | null,
    payload: CE['type'],
    result?: any,
    error?: unknown
  ): Promise<number> {
    entry.schema.parse(payload);
    const now = Date.now();
    const statusCode = error ? 255 : 0;
    const { meta } = await this.db
      .prepare(`
        INSERT INTO Commands (
          aggregate_id, type, created_at, actor, executed_at,
          status_code, error_message, result, payload
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        aggregateId,
        entry.name,
        now,
        this.user?.id || null,
        now,
        statusCode,
        error ? String(error) : null,
        result ? JSON.stringify(result) : null,
        JSON.stringify(payload),
      )
      .run();
    return meta.last_row_id || 0;
  }

  /**
   * Record an event in the Events table and publish it to the event bus
   * @param entry Event entry
   * @param aggregateId Target aggregate ID
   * @param payload Event payload
   */
  protected async recordEvent<EE extends EventEntry>(
    entry: EE,
    aggregateId: string,
    payload: EE['type'],
  ): Promise<TypedEvent<EventName>> {
    console.log('[BaseCommand] recordEvent called', entry.name, aggregateId, payload);
    entry.schema.parse(payload);
    const seqResult = await this.db
      .prepare('SELECT MAX(seq) as max_seq FROM Events WHERE aggregate_id = ?')
      .bind(aggregateId)
      .first<{ max_seq: number | null }>();
    const seq = (seqResult?.max_seq || 0) + 1;
    const now = Date.now();
    const result = await this.db
      .prepare(`
        INSERT INTO Events (
          aggregate_id, seq, type, timestamp, actor, payload
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        aggregateId,
        seq,
        entry.name,
        now,
        this.user?.id || null,
        JSON.stringify(payload),
      )
      .run();
    const event: TypedEvent<EventName> = {
      id: result.meta.last_row_id,
      aggregate_id: aggregateId,
      seq,
      type: entry.name as EventName,
      timestamp: now,
      actor: this.user?.id || null,
      payload,
    };
    console.log('[BaseCommand] Publishing event to EventBus:', event);
    await EventBus.getInstance().publish(event);
    return event;
  }

  protected abstract doExecute(payload: CommandPayload<CN>): Promise<TResult>;
}
