import type { SteenbergenMetadata } from './SteenbergenMetadata';

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

  public steen?: SteenbergenMetadata;

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
    const trimmed = trim(str);

    return new Lemma({
      value: parseLemmaValue(trimmed),
      annotations: parseAnnotations(trimmed),
    });
  }
}

function parseLemmaValue(str: string): string {
  const leftN = str.lastIndexOf('(');
  if (leftN === -1) {
    return str;
  }

  const rightN = str.lastIndexOf(')');
  if (rightN < leftN) {
    throw new Error(`Lemma value has incorrect parentheses: ${str}`);
  }

  return str.slice(0, leftN).trimEnd();
}

function parseAnnotations(str: string): string[] {
  const leftN = str.lastIndexOf('(');
  if (leftN === -1) {
    return [];
  }

  const rightN = str.lastIndexOf(')');
  if (rightN < leftN) {
    throw new Error(`Lemma value has incorrect parentheses: ${str}`);
  }

  const annotation = str.slice(leftN + 1, rightN).trim();
  // eslint-disable-next-line unicorn/no-array-callback-reference
  return annotation.split(';').map(trim);
}

function trim(str: string): string {
  return str.trim();
}
