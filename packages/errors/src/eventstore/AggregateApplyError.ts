import { BaseError } from '../base';

export interface AggregateApplyErrorDetails {
  streamId: string;
  eventId: number;
}

export class AggregateApplyError extends BaseError<AggregateApplyErrorDetails> {
  public readonly code = 'AGGREGATE_APPLY_ERROR' as const;

  constructor(public readonly streamId: unknown, public readonly eventId: number, public readonly cause?: unknown) {
    super('AGGREGATE_APPLY_ERROR', {
      details: { streamId: String(streamId), eventId },
      cause
    });
  }
}
