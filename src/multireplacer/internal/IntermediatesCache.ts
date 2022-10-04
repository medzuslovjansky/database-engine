import { Intermediate } from '../Intermediate';

export class IntermediatesCache<Context> {
  private readonly map = new Map<string, Intermediate<Context>>();

  constructor(values?: Iterable<Intermediate<Context>>) {
    if (values) {
      for (const v of values) {
        this.map.set(v.value, v);
      }
    }
  }

  public add(intermediate: Intermediate<Context>): Intermediate<Context> {
    const existing = this.map.get(intermediate.value);
    if (existing) {
      existing.link(intermediate);
    }

    this.map.set(intermediate.value, intermediate);
    return intermediate;
  }
}
