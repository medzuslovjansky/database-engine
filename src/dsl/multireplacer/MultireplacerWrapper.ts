import { core, parse, types } from '@interslavic/steen-utils';
import {
  Multireplacer,
  Odometer,
  OdometerComparison,
} from '@interslavic/odometer';
import {
  FlavorizationContext,
  FlavorizationIntermediate,
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

  compareDebug(source: string, target: string): FlavorizationMatch[];
  compareDebug(
    context: RawFlavorizationContext,
    source: string,
    target: string,
  ): FlavorizationMatch[];
}

export class MultireplacerWrapper implements IMultireplacerWrapper {
  protected readonly odometer = new Odometer<FlavorizationContext>();

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
        : MultireplacerWrapper._parseSynset(context, arg1);

    return this.multireplacer.process(toValues(synset), context);
  }

  compareDebug(
    arg1: unknown,
    arg2: unknown,
    arg3?: unknown,
  ): FlavorizationMatch[] {
    const context: FlavorizationContext =
      typeof arg1 === 'string'
        ? {}
        : MultireplacerWrapper._hydrateFlavorizationContext(
            arg1 as RawFlavorizationContext,
          );
    const source: string = typeof arg1 === 'string' ? arg1 : (arg2 as string);
    const target: string = (typeof arg1 === 'string' ? arg2 : arg3) as string;

    const flavorizedIntermediates = this.flavorizeDebug(
      context,
      MultireplacerWrapper._parseSynset(context, source),
    );

    const targetIntermediates = MultireplacerWrapper._parseIntermediates(
      context,
      target,
    );

    const sorted = this.odometer.sortByRelevance(
      flavorizedIntermediates,
      targetIntermediates,
    );

    return sorted.map((s: OdometerComparison<FlavorizationContext>) => {
      const avgLength = 0.5 * (s.query.value.length + s.result.value.length);

      return {
        source: s.query,
        target: s.result,
        distance: {
          absolute: s.editingDistance,
          percent: Math.round(100 * (s.editingDistance / avgLength)),
        },
      };
    });
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

  private static _parseSynset(context: FlavorizationContext, str: string) {
    return parse.synset(str, {
      isPhrase: context.partOfSpeech?.name === 'phrase',
    });
  }

  private static _parseIntermediates(
    context: FlavorizationContext,
    str: string,
  ) {
    const synset = this._parseSynset(context, str);
    return [...synset.lemmas()].map(toIntermediate, context);
  }
}

type RawFlavorizationContext = {
  [p in keyof FlavorizationContext]?: FlavorizationContext[p] | string;
};

function toValues(s: core.Synset): string[] {
  return [...s.lemmas()].map(getValue);
}

function toIntermediate(
  this: FlavorizationContext,
  l: core.Lemma,
): FlavorizationIntermediate {
  return new FlavorizationIntermediate(l.value, this);
}

function getValue(s: { value: string }): string {
  return s.value;
}
