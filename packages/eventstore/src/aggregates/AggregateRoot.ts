import type { EventEnvelope } from '../envelopes';
import type { StreamIdentifier } from '../primitives';
import type { EventRegistry, AggregateState } from '../types';

export abstract class AggregateRoot<S extends AggregateState = AggregateState, R extends EventRegistry = EventRegistry> {
  #stream: StreamIdentifier;
  #state: S;
  #revision = 0;
  #uncommitted: EventEnvelope<R>[] = [];

  protected constructor(stream: StreamIdentifier, revision: number, state: S) {
    this.#stream = stream;
    this.#revision = revision;
    this.#state = state;
  }

  get stream(): StreamIdentifier {
    return this.#stream;
  }

  get revision(): number {
    return this.#revision;
  }

  get state(): S {
    return this.#state;
  }

  protected set state(state: S) {
    this.#state = state;
  }

  pullEvents(): EventEnvelope<R>[] {
    const events = this.#uncommitted;
    this.#uncommitted = [];
    return events;
  }

  /**
   * Type-safe raise method: provide event type and payload, and the envelope is created internally.
   */
  protected raise<K extends keyof R>(
    type: K,
    data: R[K],
  ): void {
    const envelope: EventEnvelope<R, K> = {
      type,
      data,
      stream: this.stream,
      ts: Date.now(),
      revision: ++this.#revision,
    };
    this.apply(envelope);
    this.#uncommitted.push(envelope);
  }

  loadFromHistory(events: Iterable<EventEnvelope<R>>): void {
    for (const event of events) {
      if (this.#revision + 1 !== event.revision) {
        throw new Error(`Invalid event revision: expected ${this.#revision + 1}, got ${event.revision}`);
      }

      this.apply(event);
      this.#revision++;
    }
  }

  protected abstract apply(event: EventEnvelope<R>): void;
}
