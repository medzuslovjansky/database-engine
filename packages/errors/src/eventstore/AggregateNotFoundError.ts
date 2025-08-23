import { BaseError } from '../base';

export interface AggregateNotFoundErrorDetails {
  streamId: string;
}

export class AggregateNotFoundError extends BaseError<AggregateNotFoundErrorDetails> {
  public readonly code = 'AGGREGATE_NOT_FOUND' as const;
  public readonly statusCode = 404 as const;

  constructor(public readonly streamId: unknown) {
    super('AGGREGATE_NOT_FOUND', {
      statusCode: 404,
      details: { streamId: `${streamId}` }
    });
  }
}
