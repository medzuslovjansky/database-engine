import { BaseError } from '../base';

export interface ProjectionProcessingErrorDetails {
  projectionName: string;
  eventId: number;
}

export class ProjectionProcessingError extends BaseError<ProjectionProcessingErrorDetails> {
  public readonly code = 'PROJECTION_PROCESSING_ERROR' as const;

  constructor(public readonly projectionName: string, public readonly eventId: number, public readonly cause?: unknown) {
    super('PROJECTION_PROCESSING_ERROR', {
      details: { projectionName, eventId },
      cause
    });
  }
}
