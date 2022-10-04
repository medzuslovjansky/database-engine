import { Intermediate } from '../Intermediate';

export interface ObjectPredicate<Context> {
  appliesTo(value: Intermediate<Context>): boolean;
}
