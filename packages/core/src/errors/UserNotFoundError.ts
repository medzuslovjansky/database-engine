export class UserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User with id ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}
