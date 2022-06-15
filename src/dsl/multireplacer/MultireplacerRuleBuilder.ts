import {
  FunctionExecutor,
  Intermediate,
  MapExecutor,
  RegExpExecutor,
} from '@interslavic/odometer';
import { ExecutorCallback } from './ExecutorCallback';

export class MultireplacerRuleBuilder {
  executor: ExecutorCallback | null = null;

  regexp(match: RegExp, replacements: string[]) {
    this.executor = (rule) =>
      new RegExpExecutor(
        match,
        replacements.map((r) => rule.authorReplacement(r)),
      );

    return this;
  }

  map(keyValues: Record<string, string>) {
    this.executor = (rule) =>
      new MapExecutor(rule.authorReplacement(keyValues));
    return this;
  }

  lowerCase() {
    this.executor = (rule) =>
      new FunctionExecutor(
        rule.authorReplacement((r: Intermediate) => [r.value.toLowerCase()]),
      );

    return this;
  }

  restoreCase() {
    return this;
  }
}
