export interface SteenWordsRecord {
  id: number;
  addition?: string;
  partOfSpeech?: string;
  type?: number;
  sameInLanguages?: string;
  genesis?: string;
  frequency?: number;
  intelligibility?: string;
  using_example?: string;

  [language: string]: string | number | undefined;
}
