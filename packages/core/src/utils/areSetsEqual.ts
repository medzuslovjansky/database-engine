export function areSetsEqual<T>(a: Set<T> | undefined, b: Set<T> | undefined): boolean {
  if (a?.size !== b?.size) return false;
  if (!a || !b) return true;

  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}