import type { IntelligibilityRecord, SteenWordsRecord } from '@core/structures';
import { SteenEntryAggregate } from './SteenEntryAggregate';
import type { SteenEntryEvent } from './events/types';

// Sample data based on the provided tables
const record1: SteenWordsRecord = {
  id: 24020,
  isv: 'abak',
  partOfSpeech: 'm.',
  type: 1,
  en: 'abacus',
  sameInLanguages: 'v z j',
  genesis: 'I',
  ru: 'счёты, абак, абака',
  be: 'абак',
  uk: 'рахівниця (абак), абак',
  pl: 'abak, abakus',
  cs: 'počítadlo, abakus',
  sk: 'počítadlo, abakus',
  sl: 'abak, abakus',
  hr: 'abakus',
  sr: 'абакус',
  mk: 'сметалка, абакус',
  bg: 'сметало, абак',
  cu: '!',
  de: 'Abakus',
  nl: 'telraam',
  eo: 'abako',
  frequency: 1504,
  intelligibility: 'pl+ cs-',
  using_example: '',
};

const record2: SteenWordsRecord = {
  id: -24020,
  isv: 'abak',
  partOfSpeech: 'm.',
  type: 1,
  en: 'abacus',
  sameInLanguages: 'v z j',
  genesis: 'I',
  ru: 'счёты, абак, абака',
  pl: 'abak, abakus',
  cs: 'počítadlo, abakus',
  de: 'Abakus',
  csb: 'abakùs',
  dsb: 'abakus',
  hsb: 'Abak',
  ia: 'abaco',
  es: 'ábaco',
  pt: 'ábaco',
  fr: 'boulier, abaque',
  it: '!abaco',
  he: 'אָבָּקוּס, חֶשְׁבּוֹנִיָּה',
  da: '!abacus',
};

const record3: IntelligibilityRecord = {
  id: 24020,
  lemma: 'abak',
  ratedBy: 'admin@example.com',
  sourceLanguage: 'isv',
  targetLanguage: 'uk',
  mark: '.',
  cognates: ['абак'],
};

describe('SteenEntryAggregate', () => {
  test('importChanges twice produces two SteenEntryImported events with correct revisions', () => {
    const aggregate = new SteenEntryAggregate(record1.id);
    aggregate.importChanges(record1);
    aggregate.importChanges(record2);
    const events = aggregate.pullEvents().map(resetTime);
    expect(events).toMatchSnapshot();
  });

  test('remove produces SteenEntryRemoved event', () => {
    const aggregate = new SteenEntryAggregate(record1.id);
    aggregate.importChanges(record1);
    aggregate.remove();
    const [, removed] = aggregate.pullEvents().map(resetTime);
    expect(removed).toMatchSnapshot();
  });

  test('rateIntelligibility produces IntelligibilityRated event', () => {
    const aggregate = new SteenEntryAggregate(record1.id);
    aggregate.importChanges(record1);
    aggregate.rateIntelligibility(record3);
    const [, rated] = aggregate.pullEvents().map(resetTime);
    expect(rated).toMatchSnapshot();
  });

  test('can be serialized', () => {
    const aggregate = new SteenEntryAggregate(record1.id);
    aggregate.importChanges(record1);
    aggregate.importChanges(record2);
    aggregate.rateIntelligibility(record3);
    const serialized = aggregate.toJSON();
    expect(serialized).toMatchSnapshot();
  });
});

function resetTime<T extends SteenEntryEvent>(event: T): T {
  return { ...event, ts: 0 };
}
