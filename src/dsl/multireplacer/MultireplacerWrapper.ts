import { core, parse, types } from '@interslavic/steen-utils';
import { Multireplacer, Rule } from '../../multireplacer';
import {
  FlavorizationContext,
  FlavorizationIntermediate,
} from '../../customization';

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

  flavorize(
    source: string,
    partOfSpeech?: string,
    genesis?: string,
  ): core.Synset;
  flavorize(context: RawFlavorizationContext, synset: core.Synset): core.Synset;

  readonly stats: RuleEfficiencyReport[];
}

export class MultireplacerWrapper implements IMultireplacerWrapper {
  constructor(
    public readonly name: string,
    protected readonly multireplacer: Multireplacer<FlavorizationContext>,
  ) {}

  protected readonly _stats: RuleEfficiencyReport[] = [
    ...this.multireplacer.rules,
  ].map((r) => ({
    rule: r.name,
    replacements: r.replacements.map((rp) => ({
      value: rp.value,
      hits: 0,
    })),
  }));

  protected readonly _ruleIndices: Map<Rule<unknown>, number> = new Map(
    [...this.multireplacer.rules].map((rule, index) => [rule, index]),
  );

  flavorize(
    arg1: string | RawFlavorizationContext,
    arg2: core.Synset | string | undefined,
    arg3?: string,
  ): core.Synset {
    return new core.Synset().add(
      this.flavorizeDebug(arg1, arg2, arg3).map(getValue),
    );
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

  get stats(): RuleEfficiencyReport[] {
    return this._stats;
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

type RuleEfficiencyReport = {
  rule: string;
  replacements: {
    value: unknown;
    hits: number;
  }[];
};

function toValues(s: core.Synset): string[] {
  return [...s.lemmas()].map(getValue);
}

function getValue(s: { value: string }): string {
  return s.value;
}
