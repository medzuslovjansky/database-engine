import { BaseError } from '../base';

export interface ProjectionNotFoundErrorDetails {
  projectionName: string;
}

export class ProjectionNotFoundError extends BaseError<ProjectionNotFoundErrorDetails> {
  public readonly code = 'PROJECTION_NOT_FOUND' as const;

  constructor(public readonly projectionName: string) {
    super('PROJECTION_NOT_FOUND', {
      details: { projectionName }
    });
  }
}
