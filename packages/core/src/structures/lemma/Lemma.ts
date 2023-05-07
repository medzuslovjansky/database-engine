import { parseLemma } from './parseLemma';

export type LemmaOptions = {
  value: string;
  annotations: string[];
};

export class Lemma {
  constructor(options: Partial<LemmaOptions> = {}) {
    this.value = options.value ?? '';
    this.annotations = options.annotations ?? [];
  }

  public value: string;

  public annotations: string[];

  public clone(): Lemma {
    return new Lemma({
      value: this.value,
      annotations: [...this.annotations],
    });
  }

  public toString(): string {
    if (this.annotations.length === 0) {
      return this.value;
    }

    return `${this.value} (${this.annotations.map(String).join('; ')})`;
  }

  public static parse(str: string): Lemma {
    return new Lemma(parseLemma(str));
  }
}
