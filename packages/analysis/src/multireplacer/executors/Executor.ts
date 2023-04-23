import type { Intermediate } from '../Intermediate';
import type { Replacement } from '../Replacement';

export interface Executor<Context> {
  execute(intermediate: Intermediate<Context>): Intermediate<Context>[];
  indexOf(replacement: Replacement<unknown, Context>): number;
}
