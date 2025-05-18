import type { ProjectionStore } from '../../src/stores';

import { InMemoryMapStore } from './InMemoryMapStore';

export class InMemoryProjectionStore
  extends InMemoryMapStore<string, number> implements ProjectionStore {

  constructor(initialPositions?: Partial<Record<string, number>>) {
    const items: Array<[string, number]> = initialPositions
      ? Object.entries(initialPositions)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value as number])
      : [];

    super(items);
  }

  async getPositions(projectionNames: string[]): Promise<Record<string, number>> {
    const result = {} as Record<string, number>;

    for (const name of projectionNames) {
      result[name] = this.items.get(name) ?? 0;
    }

    return result;
  }

  async updatePosition(name: string, position: number): Promise<void> {
    this.items.set(name, position);
  }

  async resetPosition(name: string): Promise<void> {
    this.items.set(name, 0);
  }

  getPosition(name: string): number {
    return this.items.get(name) ?? 0;
  }

  get allPositions(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.items.entries()) {
      result[key] = value;
    }
    return result;
  }
}
