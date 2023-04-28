export function isIterable<T>(value: T | Iterable<T>): value is Iterable<T> {
  return (
    value && typeof (value as Iterable<unknown>)[Symbol.iterator] === 'function'
  );
}
