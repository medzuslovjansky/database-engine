import { StreamIdentifier } from '../primitives';
import type { Event } from '../envelopes';
import { AggregateRegistrationNotFoundError, DuplicateAggregateRegistrationError } from '../errors';

import type { AggregateRoot } from './AggregateRoot';
import type { AggregateRegistration } from './AggregateFactory';

const defaultSerializer = <T>(s: T) => JSON.stringify(s);
const defaultDeserializer = <T>(s: string) => JSON.parse(s) as T;

export class AggregateRegistry {
  #registrations: Map<string, AggregateRegistration<any>> = new Map();

  register<S>(registration: AggregateRegistration<S>): this {
    if (this.#registrations.has(registration.prefix)) {
      throw new DuplicateAggregateRegistrationError(registration.prefix);
    }

    this.#registrations.set(registration.prefix, registration);
    return this;
  }

  instantiate<S, T extends AggregateRoot<S>>(
    streamOrId: string | StreamIdentifier,
    revision: number,
    state: S
  ): T {
    const stream = typeof streamOrId === 'string' ? StreamIdentifier.fromString(streamOrId) : streamOrId;
    const registration = this.#getRegistrationForStream(stream) as AggregateRegistration<S, Event, T>;
    return new registration.constructor(stream, revision, state) as T;
  }

  serialize<S>(stream: StreamIdentifier, state: S): string {
    const registration = this.#getRegistrationForStream(stream);
    const serialize = registration.serialize ?? defaultSerializer;
    return serialize(state);
  }

  deserialize<S>(stream: StreamIdentifier, serialized: string): S {
    const registration = this.#getRegistrationForStream(stream);
    const deserialize = registration.deserialize ?? defaultDeserializer;
    return deserialize(serialized) as S;
  }

  #getRegistrationForStream({ prefix }: StreamIdentifier): AggregateRegistration {
    const registration = this.#registrations.get(prefix);
    if (!registration) {
      throw new AggregateRegistrationNotFoundError(prefix);
    }
    return registration;
  }
}
