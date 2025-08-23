import { BaseError } from '../base';

export interface InvalidStreamIdFormatErrorDetails {
  streamId: string;
}

export class InvalidStreamIdFormatError extends BaseError<InvalidStreamIdFormatErrorDetails> {
  public readonly code = 'INVALID_STREAM_ID_FORMAT' as const;

  constructor(public readonly streamId: string) {
    super('INVALID_STREAM_ID_FORMAT', {
      details: { streamId }
    });
  }
}
