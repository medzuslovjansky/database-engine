import type { EventEnvelope } from '../envelopes';
import type { EventRegistry } from '../types';

export type EventHandler<R extends EventRegistry = EventRegistry, K extends keyof R = keyof R> =
  (event: EventEnvelope<R, K>) => Promise<void> | void;

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventBus<R extends EventRegistry = EventRegistry> {
  publish(events: EventEnvelope<R>[]): Promise<void>;
  subscribe<K extends keyof R>(types: K[], handler: EventHandler<R, K>): EventSubscription;
}
