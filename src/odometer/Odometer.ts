import { getEditingDistance } from './utils/getEditingDistance';

export type OdometerOptions<T, L> = {
  ignoreCase: boolean;
  ignoreNonLetters: boolean;
  ignoreDiacritics: boolean;
  extractItems: (item: T) => Iterable<L>;
  extractValue: (item: L) => string;
  compareCharacters: (a: string, b: string) => number;
};

export type OdometerComparison<T> = {
  query: T;
  result: T;
  editingDistance: number;
  editingDistancePercent: number;
};

export class Odometer<T, L> {
  public readonly options: OdometerOptions<T, L>;

  constructor(options?: Partial<OdometerOptions<T, L>>) {
    this.options = {
      ignoreCase: false,
      ignoreNonLetters: false,
      ignoreDiacritics: false,
      extractItems: (x) => x as any,
      extractValue: (x) => `${x}`,
      compareCharacters: (a, b) => (a === b ? 0 : 1),

      ...options,
    };
  }

  public compare(searchQueries: T, searchResults: T): OdometerComparison<L> {
    let minimalDistance = Number.POSITIVE_INFINITY;
    let closestMatch: OdometerComparison<L> | null = null;

    const R = [...this.options.extractItems(searchResults)];
    const Q = [...this.options.extractItems(searchQueries)];

    for (const result of R) {
      const resultValue = this.normalize(result);

      for (const query of Q) {
        const queryValue = this.normalize(query);
        const distance = getEditingDistance(
          queryValue,
          resultValue,
          this.options.compareCharacters,
        );

        if (distance < minimalDistance) {
          minimalDistance = distance;
          closestMatch = {
            query,
            result,
            editingDistance: minimalDistance,
            editingDistancePercent: Math.round(
              (200 * minimalDistance) /
                (queryValue.length + resultValue.length),
            ),
          };
        }
      }
    }

    if (!closestMatch) {
      throw new Error('No matches found. Please verify the inputs');
    }

    return closestMatch;
  }

  protected normalize(item: L): string {
    let value = this.options.extractValue(item);

    if (this.options.ignoreNonLetters) {
      value = value.replace(/[^\p{Letter}]/gu, '');
    }

    if (this.options.ignoreCase) {
      value = value.toLowerCase();
    }

    if (this.options.ignoreDiacritics) {
      value = value.normalize('NFD').replace(/\p{Mark}/gu, '');
    }

    return value;
  }
}
