import { areArraysEqual } from './areArraysEqual';

export function areObjectsEqual(a?: Record<string, unknown>, b?: Record<string, unknown>): boolean {
  if (!a || !b) return a === b;

  const keys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (!areArraysEqual(keys, bKeys)) return false;

  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
