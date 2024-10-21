const _index = Symbol('index');
const _values = Symbol('values');
const _notes = Symbol('notes');

export type ArrayMapper<R extends Record<string, any>> = (new (
  values: any,
  index?: number,
  notes?: unknown,
) => ArrayMapped<R>) & {
  getColumnIndex(propertyName: keyof R): number | undefined;
};

export type ArrayMapped<R extends Record<string, any>> = {
  [P in keyof R]: R[P];
} & Iterable<unknown> & {
    getCopy(): ArrayMapped<R>;
    getKeys(): (keyof R)[];
    getIndex(): number;
    getColumnIndex(propertyName: keyof R): number;
    getSlice(from?: keyof R, to?: keyof R): unknown[];
    getNotes(): Notes<R> | undefined;
  };

export type Notes<T> = ArrayMapped<{
  [K in keyof T]: string | undefined;
}>;

export function createArrayMapperClass<R extends Record<string, any>>(
  className: string,
  propertyNames: (keyof R)[],
): ArrayMapper<R> {
  const DynamicClass = {
    [className]: class {
      [_index]: number;
      [_values]: unknown[];
      [_notes]?: Notes<R>;

      constructor(values: unknown, index = Number.NaN, notes?: unknown) {
        this[_index] = index;
        if (Array.isArray(values)) {
          this[_values] = values;
        } else {
          const obj = values as R;
          this[_values] = propertyNames.map((name) => obj[name]);
        }

        if (notes !== undefined) {
          this[_notes] = new (DynamicClass as any)(notes, index);
        }
      }

      getCopy(): ArrayMapped<R> {
        return new (DynamicClass as any)([...this[_values]], this[_index]);
      }

      getNotes(): Notes<R> | undefined {
        return this[_notes];
      }

      getKeys(): (keyof R)[] {
        return propertyNames;
      }

      getIndex(): number {
        return this[_index];
      }

      getSlice(from?: keyof R, to?: keyof R): unknown[] {
        const fromIndex = from == null ? 0 : propertyNames.indexOf(from);
        if (fromIndex === -1) {
          throw new TypeError(`Property ${String(from)} not found`);
        }

        const toIndex =
          to == null ? propertyNames.length : propertyNames.indexOf(to);
        if (toIndex === -1) {
          throw new TypeError(`Property ${String(to)} not found`);
        }

        // eslint-disable-next-line unicorn/no-new-array
        const result = new Array(toIndex - fromIndex);
        for (let i = fromIndex; i < toIndex; i++) {
          result[i - fromIndex] = this[_values][i];
        }
        return result;
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

      getColumnIndex(propertyName: keyof R): number {
        return DynamicClass.getColumnIndex(propertyName);
      }

      static getColumnIndex(propertyName: keyof R): number {
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
