import { BaseError } from '../base';

export type SlovosborErrorDetails = Record<string, unknown>;

export class SlovosborError extends BaseError<SlovosborErrorDetails> {
  public readonly code = 'SLOVOSBOR_ERROR' as const;

  constructor(code: string, payload?: Record<string, unknown>) {
    super(code, { details: payload });
  }
}
