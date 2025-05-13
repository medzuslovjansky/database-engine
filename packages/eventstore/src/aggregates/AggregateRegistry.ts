import { StreamIdentifier } from '../primitives';
import type { AggregateState } from '../types';

import type { AggregateRoot } from './AggregateRoot';
import type { AggregateRegistration } from './AggregateFactory';

const defaultSerializer = (s: unknown) => JSON.stringify(s);
const defaultDeserializer = (s: unknown) => JSON.parse(String(s));

export class AggregateRegistry {
  #registrations: Map<string, AggregateRegistration> = new Map();

  register(registration: AggregateRegistration): void {
    if (this.#registrations.has(registration.prefix)) {
      throw new Error(`Duplicate aggregate registration for prefix: ${registration.prefix}`);
    }
    this.#registrations.set(registration.prefix, registration);
  }

  instantiate<S extends AggregateState, T extends AggregateRoot<S>>(streamOrId: string | StreamIdentifier, revision = 0, state?: S): T {
    const stream = typeof streamOrId === 'string' ? StreamIdentifier.fromString(streamOrId) : streamOrId;
    const registration = this.#getRegistrationForStream(stream);
    return registration.factory(stream, revision, state) as T;
  }

  serialize<S extends AggregateState>(stream: StreamIdentifier, state: S): unknown {
    const registration = this.#getRegistrationForStream(stream);
    const serialize = registration.serialize ?? defaultSerializer;
    return serialize(state);
  }

  deserialize<S extends AggregateState>(stream: StreamIdentifier, serialized: unknown): S {
    const registration = this.#getRegistrationForStream(stream);
    const deserialize = registration.deserialize ?? defaultDeserializer;
    return deserialize(serialized);
  }

  #getRegistrationForStream({ prefix}: StreamIdentifier): AggregateRegistration {
    const registration = this.#registrations.get(prefix);
    if (!registration) {
      throw new Error(`No aggregate registration found for prefix: ${prefix}`);
    }
    return registration;
  }
}
