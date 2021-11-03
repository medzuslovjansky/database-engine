import {
  Multireplacer,
  Odometer,
  OdometerComparison,
} from '@interslavic/odometer';
import { core } from '@interslavic/steen-utils';
import { FlavorizationLevel, FlavorizationRule } from '../flavorizationRule';
import { FlavorizationContext } from '../common/FlavorizationContext';
import { TranslationAnalysis } from './TranslationAnalysis';
import { TranslationContext } from './TranslationContext';

export class FlavorizationTable {
  private readonly replacers: Record<
    keyof typeof FlavorizationLevel,
    Multireplacer<FlavorizationContext>
  > = {
    Heuristic: new Multireplacer(),
    Mistaken: new Multireplacer(),
    Standard: new Multireplacer(),
    Etymological: new Multireplacer(),
    Reverse: new Multireplacer(),
  };

  private readonly odometer = new Odometer<FlavorizationContext>();

  constructor(rules?: FlavorizationRule[]) {
    if (rules) {
      for (const rule of rules) {
        this.addRule(rule);
      }
    }
  }

  addRule(rule: FlavorizationRule) {
    for (const flavorLevel of rule.levels) {
      this.replacers[flavorLevel].rules.add(rule);
    }
  }

  analyzeTranslations(
    params: TranslationContext,
    level: 'Standard' | 'Etymological' | 'Mistaken',
  ): TranslationAnalysis {
    const toValues = (s: core.Synset) => [...s.lemmas()].map((s) => s.value);

    const translation = this.replacers.Reverse.process(
      toValues(params.translations),
      params,
    );

    const interslavic = this.replacers[level].process(
      toValues(params.interslavic),
      params,
    );

    const sorted = this.odometer.sortByRelevance(interslavic, translation);

    if (sorted.length === 0) {
      throw new Error(
        'Expected: odometer.sortByRelevance() returned an empty array',
      );
    }

    return {
      id: params.id,
      matches: sorted.map((s: OdometerComparison<FlavorizationContext>) => {
        const avgLength = 0.5 * (s.query.value.length + s.result.value.length);

        return {
          interslavic: s.query,
          national: s.result,
          distance: {
            absolute: s.editingDistance,
            percent: Math.round(100 * (s.editingDistance / avgLength)),
          },
        };
      }),
    };
  }
}
