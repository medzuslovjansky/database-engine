import { LanguageKey, WordsDTO } from '../../db';
import { core, parse as steenparse, types } from '@interslavic/steen-utils';

export class TranslationContext {
  constructor(dto: WordsDTO, lang: LanguageKey) {
    this.id = dto.id;
    this.partOfSpeech = steenparse.partOfSpeech(dto.partOfSpeech);
    if (dto.genesis) {
      this.genesis = steenparse.genesis(dto.genesis);
    }

    const isPhrase = this.partOfSpeech.name === 'phrase';
    this.interslavic = steenparse.synset(dto.isv, { isPhrase });
    this.translations = steenparse.synset(dto[lang], { isPhrase });
  }

  public id: string;
  public interslavic: core.Synset;
  public translations: core.Synset;
  public genesis?: keyof typeof types.Genesis;
  public partOfSpeech: types.PartOfSpeech;
}
