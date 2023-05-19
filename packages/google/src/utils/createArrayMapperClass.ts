/* eslint-disable @typescript-eslint/no-explicit-any */

const _index = Symbol('index');
const _values = Symbol('values');
export const symbols = {
  index: _index,
  values: _values,
} as const;

export type ArrayMapper<R extends Record<string, any>> = (new (
  values: any,
  index?: number,
) => ArrayMapped<R>) & {
  readonly mapFn: <T extends Record<string, any>>(
    values: any,
    index?: number,
  ) => ArrayMapped<T>;
  readonly symbols: typeof symbols;
};

export type ArrayMapped<R extends Record<string, any>> = {
  [P in keyof R]: R[P];
} & {
  [_index]?: number;
  [_values]: unknown[];
} & Iterable<unknown>;

export function createArrayMapperClass<R extends Record<string, any>>(
  className: string,
  propertyNames: (keyof R)[],
): ArrayMapper<R> {
  const DynamicClass = {
    [className]: class {
      [_index]?: number;
      [_values]: unknown[];

      constructor(values: unknown, index?: number) {
        this[_index] = index;
        if (Array.isArray(values)) {
          this[_values] = values;
        } else {
          const obj = values as R;
          this[_values] = propertyNames.map((name) => obj[name]);
        }
      }

      [Symbol.iterator]() {
        return this[_values][Symbol.iterator]();
      }

      static mapFn(values: unknown, index?: number) {
        return new DynamicClass(values, index);
      }
    },
  }[className];

  Object.defineProperty(DynamicClass, 'symbols', {
    get: () => symbols,
  });

  for (const [index, name] of propertyNames.entries()) {
    Object.defineProperty(DynamicClass.prototype, name, {
      get: function () {
        return this[_values][index];
      },
      set: function (value) {
        this[_values][index] = value;
      },
      enumerable: true,
    });
  }

  return DynamicClass as unknown as ArrayMapper<R>;
}
