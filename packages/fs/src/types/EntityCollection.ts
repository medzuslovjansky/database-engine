import type { Entity } from './Entity';

export interface EntityCollection<ID, T extends Entity<ID>> {
  readonly id: string;
  readonly items: T[];
}
