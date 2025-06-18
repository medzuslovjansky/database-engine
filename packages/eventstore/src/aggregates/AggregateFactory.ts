import type { StreamIdentifier } from '../primitives';
import type { Event } from '../envelopes';

import type { AggregateRoot } from './AggregateRoot';

export type AggregateFactory<
  S = unknown,
  E extends Event = Event,
  T extends AggregateRoot<S, E> = AggregateRoot<S, E>
> = (id: StreamIdentifier, revision: number, state?: S) => T;

export interface AggregateRegistration<
  S = unknown,
  E extends Event = Event,
  T extends AggregateRoot<S, E> = AggregateRoot<S, E>
> {
  prefix: string;
  factory: AggregateFactory<S, E, T>;
  serialize?: (state: S) => string;
  deserialize?: (serialized: string) => S;
}
