import { BaseError } from '../base';

export class NoProjectionsFoundError extends BaseError {
  public readonly code = 'NO_PROJECTIONS_FOUND' as const;

  constructor() {
    super('NO_PROJECTIONS_FOUND');
  }
}
