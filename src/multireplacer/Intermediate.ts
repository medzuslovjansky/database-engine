import { Replacement } from './Replacement';

export class Intermediate<ContextClass = unknown> {
  public readonly value: string;
  public readonly context: ContextClass;
  public readonly parent: Intermediate<ContextClass> | null;
  public readonly root: Intermediate<ContextClass> | null;
  public readonly via: Replacement<unknown, ContextClass> | null;
  public readonly rank: number;

  public dupes: Set<Intermediate<ContextClass>> | null = null;

  constructor(
    value: string,
    parent: Intermediate<ContextClass> | ContextClass,
    via?: Replacement<unknown, ContextClass>,
  ) {
    this.value = value;
    this.via = via || null;

    if (parent instanceof Intermediate) {
      this.context = parent.context;
      this.parent = parent;
      this.root = parent.root || parent;
      this.rank = parent.rank + 1;
    } else {
      this.context = parent;
      this.parent = null;
      this.root = this;
      this.rank = 0;
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: Intermediate<ContextClass>): boolean {
    return this.value === other.value;
  }

  link(other: Intermediate<ContextClass>): void {
    if (this === other) {
      return;
    }

    if (!this.equals(other)) {
      throw new Error(
        `Cannot link different intermediates: ${this.value} and ${other.value}`,
      );
    }

    if (this.dupes && other.dupes) {
      if (this.dupes !== other.dupes) {
        throw new Error(
          `Cannot link intermediates with diverged duplicates sets: ${other.value}`,
        );
      }
    } else if (this.dupes) {
      other.dupes = this.dupes.add(other);
    } else if (other.dupes) {
      this.dupes = other.dupes.add(this);
    } else {
      this.dupes = other.dupes = new Set<Intermediate<ContextClass>>()
        .add(this)
        .add(other);
    }
  }

  *chain(): IterableIterator<Intermediate<ContextClass>> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let item: Intermediate<ContextClass> | null = this;

    while (item) {
      yield item;
      item = item.parent;
    }
  }

  static rankSorter<T>(a: Intermediate<T>, b: Intermediate<T>): number {
    return a.rank - b.rank;
  }

  static identity<T>(instance: Intermediate<T>): unknown {
    return instance.value;
  }
}
