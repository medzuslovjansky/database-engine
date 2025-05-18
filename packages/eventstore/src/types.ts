import type { StreamIdentifier } from './primitives';

// Removed ProjectionEventMap as it's no longer needed with the simplified Projection model
/*
export interface ProjectionEventMap {
  [projectionName: string]: Event; // Value is a union of specific Event types
}
*/

export interface Logger {
  child?(options: Record<string, unknown>): Logger;
  log(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface StreamPointer {
  stream: string | StreamIdentifier;
  revision?: number;
}

