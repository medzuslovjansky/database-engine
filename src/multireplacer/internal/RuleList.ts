import { Rule } from '../Rule';
import { Replacement } from '../Replacement';

export class RuleList<Context> {
  protected readonly rules: Rule<Context>[] = [];
  protected readonly ruleInstances = new Set<Rule<Context>>();

  [Symbol.iterator](): IterableIterator<Rule<Context>> {
    return this.rules[Symbol.iterator]();
  }

  public add(...rules: Rule<Context>[]): void {
    for (const rule of rules) {
      if (this.ruleInstances.has(rule)) {
        throw new Error(`Replacement rule (${rule}) has been already added.`);
      }

      this.rules.push(rule);
      this.ruleInstances.add(rule);
    }
  }

  public find(
    value: Rule<Context> | Replacement<unknown, Context> | null,
  ): Rule<Context> | null {
    if (value instanceof Rule) {
      const index = this.rules.indexOf(value);
      if (index >= 0) {
        return this.rules[index];
      }
    }

    if (value instanceof Replacement) {
      for (const rule of this.rules) {
        if (rule.indexOf(value) >= 0) {
          return rule;
        }
      }
    }

    return null;
  }
}
