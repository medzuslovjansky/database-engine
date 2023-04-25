import type { Annotation } from '../annotation';

export type LemmaOptions = {
  value: string;
  annotations: Annotation[];
};

export class Lemma {
  constructor(value: string | Partial<LemmaOptions> = {}) {
    if (typeof value === 'string') {
      this.value = value;
      this.annotations = [];
    } else {
      const options = value;

      this.value = options.value || '';
      this.annotations = options.annotations || [];
    }
  }

  public value: string;

  public annotations: Annotation[];

  public clone(): Lemma {
    return new Lemma({
      value: this.value,
      annotations: this.annotations.map((a) => a.clone()),
    });
  }

  public toString(): string {
    const n = this.annotations.length;

    if (n === 0) {
      return this.value;
    }

    return `${this.value} (${this.annotations.map(String).join('; ')})`;
  }
}
