import { LanguageKey, LANGUAGES } from '../common/LanguagesMixin';
import { RawRecord, TableDTO } from '../common';
import { asTrimmedString } from '../../../utils';

export class WordsDTO implements TableDTO, Record<LanguageKey, string> {
  public id: string;
  public isv: string;
  public addition = '';
  public partOfSpeech = '';
  public type = '';
  public sameInLanguages = '';
  public genesis = '';
  public frequency = '';
  public using_example = '';
  public en = '';
  public ru = '';
  public be = '';
  public uk = '';
  public pl = '';
  public cs = '';
  public sk = '';
  public bg = '';
  public mk = '';
  public sr = '';
  public hr = '';
  public sl = '';
  public cu = '';
  public de = '';
  public nl = '';
  public eo = '';

  constructor(record: RawRecord) {
    this.id = asTrimmedString(record.id);
    this.isv = asTrimmedString(record.isv);
    this.addition = asTrimmedString(record.addition);
    this.partOfSpeech = asTrimmedString(record.partOfSpeech);
    this.type = asTrimmedString(record.type);
    this.sameInLanguages = asTrimmedString(record.sameInLanguages);
    this.genesis = asTrimmedString(record.genesis);
    this.frequency = asTrimmedString(record.frequency);
    this.using_example = asTrimmedString(record.using_example);

    for (const lang of LANGUAGES) {
      if (record[lang]) {
        this[lang] = asTrimmedString(record[lang]);
      }
    }
  }

  serialize() {
    return { ...(this as unknown as Record<string, string>) };
  }
}
