import { Intermediate } from '../Intermediate';
import type { Replacement } from '../Replacement';

import type { Executor } from './Executor';

type IntermediateReplacerFunction<Context> = (
  intermediate: Intermediate<Context>,
) => string[];

export class FunctionExecutor<Context> implements Executor<Context> {
  constructor(
    protected readonly fn: Replacement<
      IntermediateReplacerFunction<Context>,
      Context
    >,
  ) {}

  public execute(origin: Intermediate<Context>): Intermediate<Context>[] {
    const values = this.fn.value(origin);
    return values.map((v) => new Intermediate(v, origin, this.fn));
  }

  indexOf(replacement: Replacement<unknown, Context>): number {
    return this.fn === replacement ? 0 : -1;
  }
}
