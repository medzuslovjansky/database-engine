import type { DateTimeProvider } from '@auth/core';

export class DefaultDateTimeProvider implements DateTimeProvider {
  now(): Date {
    return new Date();
  }

  nowUnix(): number {
    return Math.floor(Date.now() / 1000);
  }

  fromUnix(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  toUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
