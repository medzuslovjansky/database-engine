import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when trying to register a projection with a name that is already registered
 */
export class DuplicateProjectionRegistrationError extends EventStoreError {
  constructor(name: string) {
    super(`Duplicate projection registration: ${name}`);
  }
}
