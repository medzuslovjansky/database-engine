export function areArraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  // eslint-disable-next-line unicorn/no-array-method-this-argument
  return a.every(isEqual, b);
}

function isEqual<T>(this: T[], item: T, index: number): boolean {
  return this[index] === item;
}
