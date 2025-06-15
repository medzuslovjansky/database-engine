import type { DateTimeProvider } from '@auth/core';

export class DefaultDateTimeProvider implements DateTimeProvider {
  now(): Date {
    return new Date();
  }

  nowUnix(): number {
    return Date.now();
  }

  fromUnix(timestamp: number): Date {
    return new Date(timestamp);
  }

  toUnix(date: Date): number {
    return date.getTime();
  }
}
