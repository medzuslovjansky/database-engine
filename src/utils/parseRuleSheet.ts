import _ from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';

import {
  Multireplacer,
  MultireplacerPredicate,
  MultireplacerRule,
} from '@interslavic/odometer';

import createMapReplacer from './createMapReplacer';

import { FlavorizationLevel } from '../types/FlavorizationLevel';
import { FlavorizationRuleDTO } from '../types/FlavorizationRuleDTO';

import { parseCSV } from './parseCSV';
import { BareRecord } from '../types/BareRecord';

export async function parseRuleSheet(
  buffer: Buffer | string,
): Promise<Record<keyof typeof FlavorizationLevel, Multireplacer<BareRecord>>> {
  const rawRecords = await parseCSV(buffer, ';');

  const dtos: FlavorizationRuleDTO[] = rawRecords.map((r, rowIndex) => ({
    rowIndex,
    disabled: r.disabled || '',
    id: r.id || '',
    flavorizationLevel: r.flavorizationLevel || '',
    match: r.match || '',
    flags: r.flags || '',
    partOfSpeech: r.partOfSpeech || '',
    genesis: r.genesis || '',
    replacement1: r.replacement1 || '',
    replacement2: r.replacement2 || '',
    replacement3: r.replacement3 || '',
    replacement4: r.replacement4 || '',
    replacement5: r.replacement5 || '',
  }));

  const replacers: Record<
    keyof typeof FlavorizationLevel,
    Multireplacer<BareRecord>
  > = {
    Heuristic: new Multireplacer(),
    Reverse: new Multireplacer(),
    Standard: new Multireplacer(),
    Silly: new Multireplacer(),
    Etymological: new Multireplacer(),
  };

  for (const dto of dtos) {
    if (dto.disabled || !dto.match) {
      continue;
    }

    if (!dto.id) {
      throw new Error(`Rule at row ${dto.rowIndex} has no ID`);
    }

    const rule = new MultireplacerRule<BareRecord>(dto.id);

    const flags = new Set(dto.flags.split(/\s+/));
    rule.searchValue = flags.has('FIXED')
      ? dto.match
      : new RegExp(dto.match, 'g');

    if (flags.has('BY-WORD')) {
      rule.splitter = 'word';
    } else if (flags.has('BY-LETTER')) {
      rule.splitter = 'letter';
    }

    if (dto.genesis) {
      let isApproximate = false;
      let isNegated = false;

      const genesisSet = new Set(
        dto.genesis
          .split('')
          .filter((letter) => {
            switch (letter) {
              case '?':
                isApproximate = true;
                return false;
              case '!':
                isNegated = true;
                return false;
              default:
                return true;
            }
          })
          .map((letter) => steenparse.genesis(letter)),
      );

      let predicate: MultireplacerPredicate<BareRecord>;

      if (isNegated) {
        predicate = isApproximate
          ? (p) => !p.context.genesis || !genesisSet.has(p.context.genesis)
          : (p) => !!p.context.genesis && !genesisSet.has(p.context.genesis);
      } else {
        predicate = isApproximate
          ? (p) => !p.context.genesis || genesisSet.has(p.context.genesis)
          : (p) => !!p.context.genesis && genesisSet.has(p.context.genesis);
      }

      rule.predicates.and(predicate);
    }

    if (dto.partOfSpeech && !dto.partOfSpeech.startsWith('*')) {
      const isNegated = dto.partOfSpeech.startsWith('!');
      const actualPartOfSpeech = isNegated
        ? dto.partOfSpeech.slice(1)
        : dto.partOfSpeech;
      const partOfSpeech = _.pickBy(
        steenparse.partOfSpeech(actualPartOfSpeech),
        _.identity,
      );

      const predicate: MultireplacerPredicate<BareRecord> = (p) => {
        return _.isMatch(p.context.partOfSpeech, partOfSpeech);
      };

      if (isNegated) {
        rule.predicates.andNot(predicate);
      } else {
        rule.predicates.and(predicate);
      }
    }

    for (const replacement of [
      dto.replacement1,
      dto.replacement2,
      dto.replacement3,
      dto.replacement4,
      dto.replacement5,
    ]) {
      if (!replacement.trim()) {
        continue;
      }

      if (replacement === 'NULL') {
        rule.replacements.add('');
      } else if (flags.has('MAP')) {
        rule.replacements.add(createMapReplacer(replacement));
      } else {
        rule.replacements.add(replacement);
      }
    }

    switch (dto.flavorizationLevel) {
      case FlavorizationLevel.Silly:
        replacers.Silly.rules.add(rule);
        break;
      case FlavorizationLevel.Etymological:
        replacers.Etymological.rules.add(rule);
        break;
      case FlavorizationLevel.Reverse:
        replacers.Reverse.rules.add(rule);
        replacers.Heuristic.rules.add(rule);
        break;
      case FlavorizationLevel.Heuristic:
        replacers.Heuristic.rules.add(rule);
        break;
      default:
        replacers.Silly.rules.add(rule);
        replacers.Standard.rules.add(rule);
        replacers.Etymological.rules.add(rule);
        break;
    }
  }

  return replacers;
}
