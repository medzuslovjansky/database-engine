import { BaseError } from '../base';

export interface ProjectionFlushErrorDetails {
  projectionName: string;
}

export class ProjectionFlushError extends BaseError<ProjectionFlushErrorDetails> {
  public readonly code = 'PROJECTION_FLUSH_ERROR' as const;

  constructor(public readonly projectionName: string, public readonly cause?: unknown) {
    super('PROJECTION_FLUSH_ERROR', {
      details: { projectionName },
      cause
    });
  }
}
