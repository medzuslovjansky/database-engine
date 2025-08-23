import type { SteenEntryImportedPayload } from '@core/aggregates';
import { MultilingualSynset, Synset } from '@core/structures';
import type { Language } from '@core/constants';

export function fromSteenEntryImportedEvent(event: SteenEntryImportedPayload): MultilingualSynset {
  const multi = new MultilingualSynset();
  multi.id = Math.abs(event.id);
  multi.beta = event.id < 0;

  const debated = new Set<string>();
  const eventCopy: Record<string, any> = { ...event };

  // Check all string fields for debated marker
  for (const [key, value] of Object.entries(eventCopy)) {
    if (typeof value === 'string' && value.startsWith('#')) {
      debated.add(key);
      eventCopy[key] = value.slice(1);
    }
  }

  if (eventCopy.translations) {
    for (const [lang, value] of Object.entries(eventCopy.translations)) {
      if (typeof value !== 'string' || !value) continue;
      const synset = multi.synsets[lang as Language] = Synset.parse(value);

      for (const lemma of synset.lemmas) {
        lemma.metadata = {
          id: eventCopy.id,
          partOfSpeech: eventCopy.partOfSpeech ?? '',
          addition: eventCopy.addition,
          type: eventCopy.type == null ? undefined : Number(eventCopy.type),
          sameInLanguages: eventCopy.sameInLanguages,
          genesis: eventCopy.genesis,
          frequency: eventCopy.frequency ? Number(eventCopy.frequency) : undefined,
          using_example: eventCopy.using_example,
        };
      }
    }
  }

  if (debated.size > 0) {
    // @ts-expect-error: debated type is correct
    multi.steen = { debated };
  }

  return multi;
}
