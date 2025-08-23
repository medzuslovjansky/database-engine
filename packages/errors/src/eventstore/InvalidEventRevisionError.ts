import { BaseError } from '../base';

export interface InvalidEventRevisionErrorDetails {
  expected: number;
  actual: number;
}

export class InvalidEventRevisionError extends BaseError<InvalidEventRevisionErrorDetails> {
  public readonly code = 'INVALID_EVENT_REVISION' as const;

  constructor(public readonly expected: number, public readonly actual: number) {
    super('INVALID_EVENT_REVISION', {
      details: { expected, actual }
    });
  }
}
