export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
