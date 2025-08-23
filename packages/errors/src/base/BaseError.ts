/**
 * Base error class for all application errors
 * Uses generic to ensure type-safe details
 */
export abstract class BaseError<TDetails = undefined> extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: TDetails;

  constructor(
    code: string,
    options?: {
      statusCode?: number;
      details?: TDetails;
      cause?: unknown;
    }
  ) {
    super(code); // Use code as the message
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = options?.statusCode;
    this.details = options?.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set cause if provided
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
