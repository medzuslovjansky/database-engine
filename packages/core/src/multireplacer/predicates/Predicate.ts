import type { FunctionPredicate } from './FunctionPredicate';
import type { ObjectPredicate } from './ObjectPredicate';

export type Predicate<Context> =
  | FunctionPredicate<Context>
  | ObjectPredicate<Context>;
