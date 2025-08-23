export abstract class InMemoryMapStore<K, V> {
  protected readonly items = new Map<K, V>();

  constructor(items: [K, V][] = []) {
    for (const [key, value] of items) {
      this.items.set(key, value);
    }
  }

  clear(): void {
    this.items.clear();
  }

  get count(): number {
    return this.items.size;
  }

  get keys(): K[] {
    return [...this.items.keys()];
  }

  get values(): V[] {
    return [...this.items.values()];
  }

  get entries(): [K, V][] {
    return [...this.items.entries()];
  }
}
