import type { Intermediate } from '../Intermediate';

export type FunctionPredicate<Context> = (
  value: Intermediate<Context>,
) => boolean;
