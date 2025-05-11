export class SlovosborError extends Error {
  public code: string;
  public payload?: Record<string, unknown>;

  constructor(code: string, payload?: Record<string, unknown>) {
    super(code);
    this.name = 'SlovosborError';
    this.code = code;
    this.payload = payload;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, SlovosborError);
    }
  }
}
