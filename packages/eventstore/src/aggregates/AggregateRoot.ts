import type {Event} from '../envelopes';
import {AggregateApplyError, InvalidEventRevisionError} from '../errors';
import type {StreamIdentifier} from '../primitives';

export abstract class AggregateRoot<S = unknown, E extends Event = Event> {
  #stream: StreamIdentifier;
  #state: S;
  #revision = 0;
  #uncommitted: E[] = [];
  #error: unknown;

  constructor(stream: StreamIdentifier, revision: number, state: S) {
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

  pullEvents(): E[] {
    const events = this.#uncommitted;
    this.#uncommitted = [];
    return events;
  }

  /**
   * Type-safe raise method: provide event type string and payload.
   * The event constructed will conform to a member of the union type E.
   */
  protected raise<T extends E['type']>(
    type: T,
    data: Extract<E, { type: T }>['data']
  ): void {
    const envelope = {
      type,
      data,
      stream: this.stream,
      ts: Date.now(),
      revision: this.#revision + 1,
    } as Event as E;

    this.apply(envelope);
    this.#uncommitted.push(envelope);
  }

  apply(event: E): void {
    if (this.#error) {
      throw new AggregateApplyError(this.stream, event, this.#error);
    }

    if (this.#revision + 1 !== event.revision) {
      throw new InvalidEventRevisionError(this.#revision + 1, event.revision);
    }

    try {
      this.doApply(event);
      this.#revision++;
    } catch (error) {
      this.#error = error;
      throw error;
    }
  }

  applyBatch(events: Iterable<E>): void {
    for (const event of events) {
      this.apply(event);
    }
  }

  protected doApply(_event: E): void {}
}
