import { FlavorizationLevel } from './FlavorizationLevel';

export class FlavorizationLevelSet extends Set<
  keyof typeof FlavorizationLevel
> {
  public toString() {
    const values = [...this.values()].map((v) => FlavorizationLevel[v]);
    return values.join('');
  }

  public static parse(value: string): FlavorizationLevelSet {
    const result = new FlavorizationLevelSet();
    if (!value) {
      return result;
    }

    for (const letter of value.split('')) {
      switch (letter) {
        case FlavorizationLevel.Mistaken:
          result.add('Mistaken');
          continue;
        case FlavorizationLevel.Standard:
          result.add('Standard');
          continue;
        case FlavorizationLevel.Etymological:
          result.add('Etymological');
          continue;
        case FlavorizationLevel.Reverse:
          result.add('Reverse');
          continue;
        case FlavorizationLevel.Heuristic:
          result.add('Heuristic');
          continue;
      }
    }

    return result;
  }

  public static readonly none = Object.freeze(new FlavorizationLevelSet());
}
