import { BaseError } from '../base';

export class EmptyIdError extends BaseError {
  public readonly code = 'EMPTY_ID' as const;

  constructor() {
    super('EMPTY_ID');
  }
}
