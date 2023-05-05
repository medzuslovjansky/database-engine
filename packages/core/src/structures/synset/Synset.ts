import { isIterable } from '../../utils';
import { Lemma as LemmaBase } from '../lemma';

import { parseSynset } from './parseSynset';

export type SynsetOptions<Lemma extends LemmaBase = LemmaBase> =
  SynsetMetadata & {
    lemmas: Lemma[];
  };

export type SynsetMetadata = {
  verified?: boolean;
  debatable?: boolean;
};

type EqualityPredicate<T> = (a: T, b: T) => boolean;

export class Synset<Lemma extends LemmaBase = LemmaBase> {
  public verified: boolean;
  public debatable: boolean;
  public readonly lemmas: Lemma[];

  constructor(options: Partial<SynsetOptions<Lemma>> = {}) {
    this.verified = options.verified ?? false;
    this.debatable = options.debatable ?? false;
    this.lemmas = options.lemmas ?? [];
  }

  public clone(): Synset {
    return new Synset({
      verified: this.verified,
      debatable: this.debatable,
      lemmas: this.lemmas.map((g) => g.clone()),
    });
  }

  public isEmpty(): boolean {
    return this.lemmas.length === 0;
  }

  public get size(): number {
    return this.lemmas.length;
  }

  public add(value: Lemma | string | Iterable<Lemma> | Iterable<string>): this {
    if (isIterable(value) && typeof value !== 'string') {
      for (const val of value) {
        this.add(val);
      }

      return this;
    }

    let lemma: LemmaBase;

    if (typeof value === 'string') {
      lemma = LemmaBase.parse(value);
    } else if (value instanceof LemmaBase) {
      lemma = value.clone();
    } else {
      throw new TypeError('Invalid value type: ' + value);
    }

    this.lemmas.push(lemma as Lemma);

    return this;
  }

  public intersection(
    other: Synset,
    equals: EqualityPredicate<LemmaBase> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.verified && other.verified,
      debatable: this.debatable || other.debatable,
    });

    for (const l1 of this.lemmas) {
      for (const l2 of other.lemmas) {
        if (equals(l1, l2)) {
          result.add(l1.clone());
          break;
        }
      }
    }

    return result;
  }

  public includes(value: Lemma | string): boolean {
    const lemma = typeof value === 'string' ? LemmaBase.parse(value) : value;
    return this.lemmas.some((l) => l.value === lemma.value);
  }

  public union(
    other: Synset,
    equals: EqualityPredicate<LemmaBase> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.verified && other.verified,
      debatable: this.debatable || other.debatable,
    }).add(this.lemmas);

    for (const l2 of other.lemmas) {
      let exists = false;
      for (const l1 of this.lemmas) {
        if (equals(l1, l2)) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        result.add(l2.value);
      }
    }

    return result;
  }

  public difference(
    other: Synset,
    equals: EqualityPredicate<LemmaBase> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.verified && other.verified,
      debatable: this.debatable || other.debatable,
    });

    for (const l1 of this.lemmas) {
      let exists = false;
      for (const l2 of other.lemmas) {
        if (equals(l1, l2)) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        result.add(l1.clone());
      }
    }

    return result;
  }

  public clear(): this {
    this.lemmas.splice(0, Number.POSITIVE_INFINITY);
    return this;
  }

  public toString(): string {
    const hasCommas = this.lemmas.some((l) => l.value.includes(','));

    return (
      (this.debatable ? '#' : '') +
      (this.verified ? '' : '!') +
      this.lemmas.map(String).join(hasCommas ? '; ' : ', ')
    );
  }

  public static parse(str: string) {
    return new Synset(parseSynset(str));
  }
}

function valueEquals(a: LemmaBase, b: LemmaBase): boolean {
  return a.value === b.value;
}
