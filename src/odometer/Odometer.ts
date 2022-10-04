import { getEditingDistance } from './utils/getEditingDistance';

export type OdometerOptions<T> = {
  ignoreCase: boolean;
  ignoreNonLetters: boolean;
  ignoreDiacritics: boolean;
  extractValue: (item: T) => string;
  compareCharacters: (a: string, b: string) => number;
};

export type OdometerComparison<T> = {
  query: T;
  result: T;
  editingDistance: number;
  editingDistancePercent: number;
};

export class Odometer<T> {
  public readonly options: OdometerOptions<T>;

  constructor(options?: Partial<OdometerOptions<T>>) {
    this.options = {
      ignoreCase: false,
      ignoreNonLetters: false,
      ignoreDiacritics: false,
      extractValue: (x) => `${x}`,
      compareCharacters: (a, b) => (a === b ? 0 : 1),

      ...options,
    };
  }

  public compare(
    searchQueries: Iterable<T>,
    searchResults: Iterable<T>,
  ): OdometerComparison<T> {
    let minimalDistance = Number.POSITIVE_INFINITY;
    let closestMatch: OdometerComparison<T> | null = null;

    const R = [...searchResults];
    const Q = [...searchQueries];

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

  protected normalize(item: T): string {
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
