import type { StreamIdentifier } from '../primitives';
import type { AggregateState, EventRegistry } from '../types';

import type { AggregateRoot } from './AggregateRoot';

export type AggregateFactory<
  S extends AggregateState = AggregateState,
  R extends EventRegistry = EventRegistry,
  T extends AggregateRoot<S, R> = AggregateRoot<S, R>
> = (id: StreamIdentifier, revision: number, state?: S) => T;

export interface AggregateRegistration<
  S extends AggregateState = AggregateState,
  R extends EventRegistry = EventRegistry,
  T extends AggregateRoot<S, R> = AggregateRoot<S, R>
> {
  prefix: string;
  factory: AggregateFactory<S, R, T>;
  serialize?: (state: S) => unknown;
  deserialize?: (serialized: unknown) => S;
}
