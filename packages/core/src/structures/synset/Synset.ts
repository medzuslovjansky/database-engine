import { isIterable } from '../../utils';
import { Lemma } from '../lemma';

export type SynsetOptions = SynsetMetadata & {
  lemmas: Lemma[];
};

export type SynsetMetadata = {
  verified?: boolean;
  debatable?: boolean;
};

type EqualityPredicate<T> = (a: T, b: T) => boolean;

export class Synset {
  constructor(options: Partial<SynsetOptions> = {}) {
    this.meta = {
      verified: options.verified,
      debatable: options.debatable,
    };

    this.lemmas = options.lemmas || [];
  }

  public meta: SynsetMetadata;
  public lemmas: Lemma[];

  public clone(): Synset {
    return new Synset({
      ...this.meta,
      lemmas: this.lemmas.map((g) => g.clone()),
    });
  }

  public add(value: Lemma | string | Iterable<Lemma> | Iterable<string>): this {
    if (isIterable(value) && typeof value !== 'string') {
      for (const val of value) {
        this.add(val);
      }

      return this;
    }

    let lemma!: Lemma;

    if (typeof value === 'string') {
      lemma = new Lemma({ value });
    } else if (value instanceof Lemma) {
      lemma = value.clone();
    }

    if (lemma) {
      this.lemmas.push(lemma);
    } else {
      throw new TypeError('Cannot add non-Lemma/LemmaGroup/string to a synset');
    }

    return this;
  }

  public intersection(
    other: Synset,
    equals: EqualityPredicate<Lemma> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.meta.verified && other.meta.verified,
      debatable: this.meta.debatable || other.meta.debatable,
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

  public isEmpty(): boolean {
    return this.lemmas.length === 0;
  }

  public get size(): number {
    return this.lemmas.length;
  }

  public union(
    other: Synset,
    equals: EqualityPredicate<Lemma> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.meta.verified && other.meta.verified,
      debatable: this.meta.debatable || other.meta.debatable,
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
    equals: EqualityPredicate<Lemma> = valueEquals,
  ): Synset {
    const result = new Synset({
      verified: this.meta.verified && other.meta.verified,
      debatable: this.meta.debatable || other.meta.debatable,
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
      (this.meta.debatable ? '#' : '') +
      (this.meta.verified ? '' : '!') +
      this.lemmas.map(String).join(hasCommas ? '; ' : ', ')
    );
  }
}

function valueEquals(a: Lemma, b: Lemma): boolean {
  return a.value === b.value;
}
