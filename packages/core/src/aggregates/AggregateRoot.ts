import type { EventEnvelope } from './EventEnvelope';

export abstract class AggregateRoot<EventRegistry extends Record<string, any>> {
  private _uncommitted: EventEnvelope<any>[] = [];
  protected _revision = 0;

  /** Expose current revision (after replay) */
  get revision(): number {
    return this._revision;
  }

  /** Get and clear uncommitted events after command handling */
  pullEvents(): EventEnvelope<any>[] {
    const events = this._uncommitted;
    this._uncommitted = [];
    return events;
  }

  /**
   * Type-safe raise method: provide event type and payload, and the envelope is created internally.
   */
  protected raise<T extends keyof EventRegistry>(
    type: T,
    data: EventRegistry[T],
  ): void {
    const envelope: EventEnvelope<EventRegistry[T]> = {
      type: type as string,
      data,
      stream: this.getStreamName(),
      ts: Date.now(),
      revision: ++this._revision,
    };
    this.apply(envelope);
    this._uncommitted.push(envelope);
  }

  /** Rebuild from event stream */
  loadFromHistory(events: Iterable<EventEnvelope<any>>): void {
    for (const event of events) {
      this.apply(event);
      this._revision++;
    }
  }

  /** Every concrete aggregate implements this */
  protected abstract apply(event: EventEnvelope<EventRegistry[keyof EventRegistry]>): void;

  /** Optionally override to provide stream name for envelopes */
  protected abstract getStreamName(): string;
}
