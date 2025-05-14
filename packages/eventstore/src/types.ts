import type { StreamIdentifier } from './primitives';

export type EventRegistry = Record<string, any>;
export type CommandRegistry = Record<string, any>;
export type ProjectionMapping<R extends EventRegistry = EventRegistry> = Record<string, keyof R>;

export interface Logger {
  log(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface AggregateState {
  toJSON?(): object;
}

export interface StreamPointer {
  stream: string | StreamIdentifier;
  revision?: number;
}

