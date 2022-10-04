import sortedUniqBy from 'lodash/sortedUniqBy';
import { IntermediatesCache, RuleList } from './internal';
import { Intermediate } from './Intermediate';
import { Rule } from './Rule';

export class Multireplacer<Context = unknown> {
  public readonly rules = new RuleList<Context>();

  public process(values: string[], context: Context): Intermediate<Context>[] {
    let intermediates = values.map((v) => new Intermediate(v, context));
    let nextIntermediates: Intermediate<Context>[] = [];
    let rule: Rule<Context>;
    let value: Intermediate<Context>;
    const intermediatesCache = new IntermediatesCache(intermediates);

    for (rule of this.rules) {
      nextIntermediates = [];

      rule.useCache(intermediatesCache);
      for (value of intermediates) {
        nextIntermediates.push(...rule.apply(value));
      }
      rule.useCache(null);

      intermediates = sortedUniqBy(
        nextIntermediates.sort(Intermediate.rankSorter),
        Intermediate.identity,
      );
    }

    return intermediates;
  }
}
