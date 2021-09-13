import { parse as steenparse } from '@interslavic/steen-utils';
import { CognateMatch, IntelligibilityDTO } from '../types';
import { DatabaseContext } from '../types/core/DatabaseContext';

export function mapIntelligibilityRecord(
  raw: Record<string, string>,
  context: DatabaseContext,
): IntelligibilityDTO {
  const id = (raw.id || '').trim();
  const partOfSpeech = context.getPartOfSpeech(id);
  const isPhrase = partOfSpeech.name === 'phrase';

  const record: IntelligibilityDTO = {
    id: (raw.id || '').trim(),
    translations: steenparse.synset(raw.translations, { isPhrase }),
    helperWords: steenparse.synset(raw.helperWords, { isPhrase }),
    match: new CognateMatch(),
    Δmin: Number(raw['Δmin']),
    Δavg: Number(raw['Δavg']),
    Δmax: Number(raw['Δavg']),
    Rmin: Number(raw['Rmin']),
    Rmax: Number(raw['Rmax']),
    comments: raw['comments'],
  };

  return record;
}
