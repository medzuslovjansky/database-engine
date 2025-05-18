export interface InMemoryStoreConfig<T> {
  items?: T[];
}

export abstract class InMemoryStore<T> {
  protected readonly items: T[] = [];

  constructor(config: InMemoryStoreConfig<T>) {
    this.items.push(...config.items ?? []);
  }

  clear(): void {
    this.items.splice(0, this.items.length);
  }

  add(items: T[]): void {
    this.items.push(...items);
  }

  get count(): number {
    return this.items.length;
  }

  get all(): T[] {
    return [...this.items];
  }
}
