/* eslint-disable @typescript-eslint/no-explicit-any */

const _index = Symbol('index');
const _values = Symbol('values');

export type ArrayMapper<R extends Record<string, any>> = (new (
  values: any,
  index?: number,
) => ArrayMapped<R>) & {
  getColumnIndex(propertyName: keyof R): number | undefined;
};

export type ArrayMapped<R extends Record<string, any>> = {
  [P in keyof R]: R[P];
} & Iterable<unknown> & {
    getCopy(): ArrayMapped<R>;
    getIndex(): number;
    getSlice(from: keyof R, to?: keyof R): unknown[];
  };

export function createArrayMapperClass<R extends Record<string, any>>(
  className: string,
  propertyNames: (keyof R)[],
): ArrayMapper<R> {
  const DynamicClass = {
    [className]: class {
      [_index]: number | undefined;
      [_values]: unknown[];

      constructor(values: unknown, index = Number.NaN) {
        this[_index] = index;
        if (Array.isArray(values)) {
          this[_values] = values;
        } else {
          const obj = values as R;
          this[_values] = propertyNames.map((name) => obj[name]);
        }
      }

      getCopy(): ArrayMapped<R> {
        return new (DynamicClass as any)([...this[_values]], this[_index]);
      }

      getIndex(): number | undefined {
        return this[_index];
      }

      getSlice(from: keyof R, to?: keyof R): unknown[] {
        const fromIndex = propertyNames.indexOf(from);
        if (fromIndex === -1) {
          throw new Error(`Property ${String(from)} not found`);
        }

        if (to) {
          const toIndex = propertyNames.indexOf(to);
          if (toIndex === -1) {
            throw new Error(`Property ${String(to)} not found`);
          }

          return this[_values].slice(fromIndex, toIndex);
        } else {
          return this[_values].slice(fromIndex);
        }
      }

      toJSON(): R {
        const result = {} as R;
        for (const name of propertyNames) {
          result[name] = (this as any)[name];
        }

        return result;
      }

      [Symbol.iterator]() {
        return this[_values][Symbol.iterator]();
      }

      static getColumnIndex(propertyName: keyof R): number | undefined {
        return propertyNames.indexOf(propertyName);
      }
    },
  }[className];

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
