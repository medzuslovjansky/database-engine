import { Lemma } from './Lemma';

export class InterslavicLemma extends Lemma {
  public steen?: SteenbergenLemmaMetadata;

  public clone(): InterslavicLemma {
    const result = super.clone() as InterslavicLemma;
    if (this.steen) {
      result.steen = { ...this.steen };
    }

    return result;
  }
}

export type SteenbergenLemmaMetadata = {
  id: number;
  addition?: string;
  partOfSpeech: string;
  type?: number;
  sameInLanguages?: string;
  genesis?: string;
  frequency?: number;
  using_example?: string;
};
