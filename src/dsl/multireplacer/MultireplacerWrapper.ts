import { core, parse, types } from '@interslavic/steen-utils';
import { Intermediate, Multireplacer, Odometer } from '@interslavic/odometer';
import {
  FlavorizationContext,
  FlavorizationIntermediate,
  LemmaIntermediate,
} from '../../customization';
import { FlavorizationMatch } from '../intelligibility/FlavorizationMatch';

export interface IMultireplacerWrapper {
  flavorizeDebug(
    source: string,
    partOfSpeech?: string,
    genesis?: string,
  ): FlavorizationIntermediate[];
  flavorizeDebug(
    context: RawFlavorizationContext,
    synset: core.Synset,
  ): FlavorizationIntermediate[];

  flavorize(source: string, partOfSpeech?: string, genesis?: string): string[];
  flavorize(context: RawFlavorizationContext, synset: core.Synset): string[];

  compareDebug(
    context: RawFlavorizationContext,
    source: string,
    target: string,
  ): FlavorizationMatch[];
  compareDebug(
    context: RawFlavorizationContext,
    source: core.Synset,
    target: core.Synset,
  ): FlavorizationMatch[];

  compare(
    context: RawFlavorizationContext,
    source: string,
    target: string,
  ): string | null;
  compare(
    context: RawFlavorizationContext,
    source: core.Synset,
    target: core.Synset,
  ): string | null;
}

export class MultireplacerWrapper implements IMultireplacerWrapper {
  protected readonly odometer = new Odometer<unknown>({
    ignoreCase: true,
    ignoreNonLetters: true,
  });

  constructor(
    public readonly name: string,
    protected readonly multireplacer: Multireplacer<FlavorizationContext>,
  ) {}

  flavorize(
    arg1: string | RawFlavorizationContext,
    arg2: core.Synset | string | undefined,
    arg3?: string,
  ): string[] {
    return this.flavorizeDebug(arg1, arg2, arg3).map(getValue);
  }

  flavorizeDebug(
    arg1: string | RawFlavorizationContext,
    arg2: core.Synset | string | undefined,
    arg3?: string,
  ): FlavorizationIntermediate[] {
    const context = MultireplacerWrapper._packFlavorizationContext(
      arg1,
      arg2,
      arg3,
    );
    const synset =
      typeof arg1 !== 'string'
        ? (arg2 as core.Synset)
        : parse.synset(arg1, {
            isPhrase: context.partOfSpeech?.name === 'phrase',
          });

    return this.multireplacer.process(toValues(synset), context);
  }

  compareDebug(
    rawContext: RawFlavorizationContext,
    rawSource: string | core.Synset,
    rawTarget: string | core.Synset,
  ): FlavorizationMatch[] {
    const context: FlavorizationContext =
      MultireplacerWrapper._hydrateFlavorizationContext(rawContext);

    const isPhrase = context.partOfSpeech?.name === 'phrase';
    const source =
      typeof rawSource !== 'string'
        ? rawSource
        : parse.synset(rawSource, { isPhrase });
    const target =
      typeof rawTarget !== 'string'
        ? rawTarget
        : parse.synset(rawTarget, { isPhrase });

    const flavorizedIntermediates = this.flavorizeDebug(context, source);

    const targetIntermediates = [...target.lemmas()].map(toLemmaIntermediate);

    const sorted = this.odometer.sortByRelevance(
      flavorizedIntermediates,
      targetIntermediates,
    );

    return sorted.map((s) => {
      const avgLength = 0.5 * (s.query.value.length + s.result.value.length);

      // TODO: make Odomoter more generic, i.e. <T> -> <T1, T2>
      return {
        source: s.query as FlavorizationIntermediate,
        target: s.result as LemmaIntermediate,
        distance: {
          absolute: s.editingDistance,
          percent: Math.round(100 * (s.editingDistance / avgLength)),
        },
      };
    });
  }

  compare(
    context: RawFlavorizationContext,
    source: string | core.Synset,
    target: string | core.Synset,
  ): string | null {
    const results = this.compareDebug(context, source, target);
    if (results[0].distance.absolute === 0) {
      return null;
    }

    return results[0].source.value;
  }

  private static _packFlavorizationContext(
    maybeSource: string | RawFlavorizationContext,
    maybePartOfSpeech?: core.Synset | string,
    maybeGenesis?: string,
  ): FlavorizationContext {
    return this._hydrateFlavorizationContext(
      typeof maybeSource !== 'string'
        ? maybeSource
        : {
            partOfSpeech:
              typeof maybePartOfSpeech === 'string'
                ? maybePartOfSpeech
                : undefined,
            genesis: maybeGenesis,
          },
    );
  }

  private static _hydrateFlavorizationContext(
    raw: RawFlavorizationContext,
  ): FlavorizationContext {
    const context: FlavorizationContext = {};
    if (raw.partOfSpeech) {
      context.partOfSpeech =
        typeof raw.partOfSpeech === 'string'
          ? parse.partOfSpeech(raw.partOfSpeech)
          : raw.partOfSpeech;
    }

    if (raw.genesis && typeof raw.genesis === 'string') {
      context.genesis = !Reflect.has(types.Genesis, raw.genesis)
        ? parse.genesis(raw.genesis)
        : (raw.genesis as keyof typeof types.Genesis);
    }

    return context;
  }
}

type RawFlavorizationContext = {
  [p in keyof FlavorizationContext]?: FlavorizationContext[p] | string;
};

function toValues(s: core.Synset): string[] {
  return [...s.lemmas()].map(getValue);
}

function toLemmaIntermediate(l: core.Lemma): Intermediate<core.Lemma> {
  return new Intermediate(l.value, l);
}

function getValue(s: { value: string }): string {
  return s.value;
}
