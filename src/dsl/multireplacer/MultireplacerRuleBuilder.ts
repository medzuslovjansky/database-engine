import {
  MapExecutor,
  RegExpExecutor,
} from '@interslavic/odometer';
import { customExecutors } from '../../customization';
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
    this.executor = customExecutors.lowerCase;
    return this;
  }

  restoreCase() {
    this.executor = customExecutors.restoreCase;
    return this;
  }
}
