/* eslint-disable @typescript-eslint/no-explicit-any */

export type ArrayMapper<R extends Record<string, any>> = new (
  values: any[],
) => ArrayMapped<R>;

export type ArrayMapped<R extends Record<string, any>> = {
  [P in keyof R]: R[P];
} & { _values: unknown[] };

export function createArrayMapperClass<R extends Record<string, any>>(
  className: string,
  propertyNames: (keyof R)[],
): ArrayMapper<R> {
  const DynamicClass = {
    [className]: class {
      // @ts-expect-error TS6138: Property '_values' is declared but its value is never read.
      constructor(private readonly _values: unknown[]) {}
    },
  }[className];

  for (const [index, name] of propertyNames.entries()) {
    Object.defineProperty(DynamicClass.prototype, name, {
      get: function () {
        return this._values[index];
      },
      set: function (value) {
        this._values[index] = value;
      },
      enumerable: true,
    });
  }

  return DynamicClass as unknown as ArrayMapper<R>;
}
