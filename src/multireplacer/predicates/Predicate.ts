import { FunctionPredicate } from './FunctionPredicate';
import { ObjectPredicate } from './ObjectPredicate';

export type Predicate<Context> =
  | FunctionPredicate<Context>
  | ObjectPredicate<Context>;
