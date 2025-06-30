import type { StreamIdentifier } from '../primitives';
import type { Event } from '../envelopes';

import type { AggregateRoot } from './AggregateRoot';

export type AggregateConstructor<
  S = unknown,
  E extends Event = Event,
  T extends AggregateRoot<S, E> = AggregateRoot<S, E>
> = new (stream: StreamIdentifier, revision: number, state: S) => T;

export interface AggregateRegistration<
  S = unknown,
  E extends Event = Event,
  T extends AggregateRoot<S, E> = AggregateRoot<S, E>
> {
  prefix: string;
  constructor: AggregateConstructor<S, E, T>;
  serialize?: (state: S) => string;
  deserialize?: (serialized: string) => S;
}
