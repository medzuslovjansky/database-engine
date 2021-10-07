import _ from 'lodash';
import {
  Multireplacer,
  MultireplacerPredicate,
  MultireplacerRule,
  Odometer,
} from '@interslavic/odometer';

import createMapReplacer from '../utils/createMapReplacer';
import {
  FlavorizationLevel,
  FlavorizationMatch,
  FlavorizationRuleDTO,
  SimilarityParams,
  SimilarityReport,
} from '../types';
import { core } from '@interslavic/steen-utils';

export class IntelligibilityCalculator {
  private readonly replacers: Record<
    keyof typeof FlavorizationLevel,
    Multireplacer<SimilarityParams>
  > = {
    Heuristic: new Multireplacer(),
    Mistaken: new Multireplacer(),
    Standard: new Multireplacer(),
    Etymological: new Multireplacer(),
    Reverse: new Multireplacer(),
  };

  private readonly odometer = new Odometer<SimilarityParams>();

  constructor(rules: FlavorizationRuleDTO[]) {
    for (const rule of rules) {
      this.addRule(rule);
    }
  }

  addRule(rule: FlavorizationRuleDTO) {
    const multireplacerRule = new MultireplacerRule<SimilarityParams>(
      rule.name,
    );

    multireplacerRule.searchValue = rule.modifiers.fixed
      ? rule.match
      : new RegExp(rule.match, 'g');

    switch (rule.modifiers.split) {
      case 'by-word':
        multireplacerRule.splitter = 'word';
        break;
      case 'by-letter':
        multireplacerRule.splitter = 'letter';
        break;
      default:
        multireplacerRule.splitter = 'none';
        break;
    }

    for (const replacement of rule.replacements) {
      if (rule.modifiers.map) {
        multireplacerRule.replacements.add(createMapReplacer(replacement));
      } else {
        multireplacerRule.replacements.add(replacement);
      }
    }

    if (!rule.genesis.isEmpty) {
      let predicate: MultireplacerPredicate<SimilarityParams>;

      if (rule.genesis.negated) {
        predicate = rule.genesis.approximate
          ? (p) =>
              !p.context.words.genesis ||
              !rule.genesis.values.has(p.context.words.genesis)
          : (p) =>
              !!p.context.words.genesis &&
              !rule.genesis.values.has(p.context.words.genesis);
      } else {
        predicate = rule.genesis.approximate
          ? (p) =>
              !p.context.words.genesis ||
              rule.genesis.values.has(p.context.words.genesis)
          : (p) =>
              !!p.context.words.genesis &&
              rule.genesis.values.has(p.context.words.genesis);
      }

      multireplacerRule.predicates.and(predicate);
    }

    if (rule.partOfSpeech.value) {
      const shape = rule.partOfSpeech.value;
      const predicate: MultireplacerPredicate<SimilarityParams> = (p) => {
        return _.isMatch(p.context.words.partOfSpeech, shape);
      };

      if (rule.partOfSpeech.negated) {
        multireplacerRule.predicates.andNot(predicate);
      } else {
        multireplacerRule.predicates.and(predicate);
      }
    }

    for (const flavorLevel of rule.flavorizationLevel) {
      this.replacers[flavorLevel].rules.add(multireplacerRule);
    }
  }

  calcSimilarity(params: SimilarityParams): SimilarityReport {
    const toValues = (s: core.Synset) => [...s.lemmas()].map((s) => s.value);

    const translation = this.replacers.Reverse.process(
      toValues(params.intelligibility.translations),
      params,
    );

    const helpers = this.replacers.Reverse.process(
      toValues(params.intelligibility.helperWords),
      params,
    );

    const mistaken = this.replacers.Mistaken.process(
      toValues(params.words.isv),
      params,
    );

    const standard = this.replacers.Standard.process(
      toValues(params.words.isv),
      params,
    );

    const etymological = this.replacers.Etymological.process(
      toValues(params.words.isv),
      params,
    );

    const farthest = this.odometer.getDifference(
      mistaken.variants,
      translation.variants,
    );

    const average = this.odometer.getDifference(
      standard.variants,
      translation.variants,
    );

    let closest = this.odometer.getDifference(
      etymological.variants,
      translation.variants,
    );

    if (!farthest || !average || !closest) {
      throw new Error('InvariantError: odometer.getDifference() != null');
    }

    const best2 = this.odometer.getDifference(
      etymological.variants,
      helpers.variants,
    );

    if (best2 && closest.distance < closest.distance) {
      closest = best2;
    }

    const toFlavorizationMatch = (
      stats: typeof average,
    ): FlavorizationMatch => ({
      distance: {
        percent:
          (0.5 * stats.distance) /
          (stats.a.value.length + stats.b.value.length),
        absolute: stats.distance,
      },
      interslavic: stats.a,
      national: stats.b,
    });

    return {
      id: params.words.id,
      average: toFlavorizationMatch(average),
      closest: toFlavorizationMatch(closest),
      farthest: toFlavorizationMatch(farthest),
    };
  }
}
