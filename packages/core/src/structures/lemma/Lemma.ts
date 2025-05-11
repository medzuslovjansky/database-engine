import { areArraysEqual, areObjectsEqual } from '@core/utils';
import { parseLemma } from './parseLemma';
import { IntelligibilityVectorV1 } from '../intelligibility-vector';

export interface LemmaJSON<Metadata extends Record<string, unknown> = Record<string, unknown>> {
  value?: string;
  annotations?: string[];
  intelligibility?: string;
  metadata?: Metadata;
};

export interface LemmaOptions<Metadata extends Record<string, unknown> = Record<string, unknown>> {
  value?: string;
  annotations?: string[];
  intelligibility?: string | IntelligibilityVectorV1;
  metadata?: Metadata;
}

export class Lemma<Metadata extends Record<string, unknown> = Record<string, unknown>> {
  #value: string;
  #annotations: string[];
  #intelligibility: IntelligibilityVectorV1;
  #metadata?: Metadata;

  constructor(options?: LemmaOptions<Metadata>) {
    this.#value = options?.value ?? '';
    this.#annotations = options?.annotations ?? [];
    this.#metadata = options?.metadata;

    const intelligibility = options?.intelligibility;

    if (typeof intelligibility === 'string') {
      this.#intelligibility = IntelligibilityVectorV1.fromString(intelligibility);
    } else if (intelligibility) {
      this.#intelligibility = intelligibility;
    } else {
      this.#intelligibility = IntelligibilityVectorV1.empty();
    }
  }

  public get value(): string {
    return this.#value;
  }

  public set value(value: string) {
    this.#value = value;
  }

  public get annotations(): string[] {
    return this.#annotations;
  }

  public set annotations(value: string[]) {
    this.#annotations = value;
  }

  public get intelligibility(): IntelligibilityVectorV1 {
    return this.#intelligibility;
  }

  public set intelligibility(value: IntelligibilityVectorV1 | string) {
    if (typeof value === 'string') {
      this.#intelligibility = IntelligibilityVectorV1.fromString(value);
    } else {
      this.#intelligibility = value;
    }
  }

  public get metadata(): Metadata | undefined {
    return this.#metadata;
  }

  public set metadata(value: Metadata | undefined) {
    this.#metadata = value;
  }

  public clone(): Lemma<Metadata> {
    const cloned = new Lemma({
      value: this.value,
      annotations: [...this.annotations],
      intelligibility: this.intelligibility.clone(),
      metadata: this.metadata,
    });
    return cloned;
  }

  public toString(): string {
    if (this.annotations.length === 0) {
      return this.value;
    }

    return `${this.value} (${this.annotations.map(String).join('; ')})`;
  }

  public static parse<T extends Record<string, unknown>>(str: string): Lemma<T> {
    return new Lemma<T>(parseLemma<T>(str));
  }

  public toJSON(): LemmaJSON<Metadata> {
    const json: LemmaJSON<Metadata> = {};
    if (this.#value) json.value = this.#value;
    if (this.#annotations.length > 0) json.annotations = [...this.#annotations];
    if (!this.#intelligibility.isEmpty()) json.intelligibility = this.#intelligibility.toString();
    if (this.#metadata) json.metadata = this.#metadata;
    return json;
  }

  public static fromJSON<T extends Record<string, unknown>>(json: LemmaJSON<T>): Lemma<T> {
    return new Lemma(json);
  }

  public equals(other: Lemma): boolean {
    return (
      this.value === other.value &&
      areArraysEqual(this.annotations, other.annotations)
    );
  }

  public equalsStrict(other: Lemma): boolean {
    return this.equals(other) &&
      this.intelligibility.equals(other.intelligibility) &&
      areObjectsEqual(this.metadata, other.metadata);
  }
}