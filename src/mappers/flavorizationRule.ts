import {
  FlavorizationLevelSet,
  FlavorizationRuleDTO,
  FlavorizationRuleModifiers,
  FlavorizationRuleGenesisFilter,
  FlavorizationRulePartOfSpeechFilter,
  RawRecord,
} from '../types';

export function mapFlavorizationRule(raw: RawRecord): FlavorizationRuleDTO {
  const rule = new FlavorizationRuleDTO();
  rule.disabled = !!raw['disabled'];
  rule.name = raw['name'] || '';
  rule.match = raw['match'] || '';

  if (rule.disabled) {
    return rule;
  }

  if (!rule.match) {
    throw new Error('The rule lacks match');
  }

  rule.flavorizationLevel = FlavorizationLevelSet.parse(
    raw['flavorizationLevel'],
  );
  rule.modifiers = FlavorizationRuleModifiers.parse(raw['modifiers']);
  rule.partOfSpeech = FlavorizationRulePartOfSpeechFilter.parse(
    raw['partOfSpeech'],
  );
  rule.genesis = FlavorizationRuleGenesisFilter.parse(raw['genesis']);

  for (let i = 1; Reflect.has(raw, `replacement${i}`); i++) {
    const value = raw[`replacement${i}`].trim();
    if (!value) {
      continue;
    }

    if (value === 'NULL') {
      rule.replacements.push('');
    } else {
      rule.replacements.push(value);
    }
  }

  return rule;
}
