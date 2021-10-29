import { ReplacementFunction } from '@interslavic/odometer';

export type MapReplacerOptions = {
  strict: boolean;
};

const defaultOptions: MapReplacerOptions = {
  strict: false,
};

export default function createMapReplacer(
  replacement: string,
  options: MapReplacerOptions = defaultOptions,
): ReplacementFunction {
  const pairs = replacement
    .trim()
    .split(/\s+/)
    .map((pair) => {
      return pair.split('-', 2) as [string, string];
    });

  const map = new Map<string, string>(pairs);
  return function (value: string) {
    if (map.has(value)) {
      return map.get(value) || '';
    }

    if (!options.strict) {
      const U = value.toUpperCase();
      if (value !== U && map.has(U)) {
        return map.get(U)?.toLowerCase() || '';
      }

      const L = value.toLowerCase();
      if (value !== L && map.has(L)) {
        return map.get(L)?.toUpperCase() || '';
      }
    }

    return value;
  };
}
