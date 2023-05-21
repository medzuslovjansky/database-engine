import type { WordsDTO } from '../../google';

export function isRestrictedEdit(a: WordsDTO, b: WordsDTO) {
  return (
    a.isv !== b.isv ||
    a.addition !== b.addition ||
    a.partOfSpeech !== b.partOfSpeech ||
    a.type !== b.type ||
    a.sameInLanguages !== b.sameInLanguages ||
    a.genesis !== b.genesis
  );
}
