export type IdExtractor<T> = (record: T) => unknown;

export interface LeftJoin {
  <A, B>(
    idExtractor: IdExtractor<A | B>,
    a: Iterable<A>,
    b: Iterable<B>,
  ): Iterable<[A, B | null]>;
  <A, B, C>(
    idExtractor: IdExtractor<A | B | C>,
    a: Iterable<A>,
    b: Iterable<B>,
    c: Iterable<C>,
  ): Iterable<[A, B | null, C | null]>;
  <A, B, C, D>(
    idExtractor: IdExtractor<A | B | C | D>,
    a: Iterable<A>,
    b: Iterable<B>,
    c: Iterable<C>,
    d: Iterable<D>,
  ): Iterable<[A, B | null, C | null, D | null]>;
  <T, To>(
    idExtractor: IdExtractor<T | To>,
    mainTable: Iterable<T>,
    ...otherTables: Iterable<To>[]
  ): Iterable<[T, ...(To | null)[]]>;
}

export const leftJoin: LeftJoin = function* <T, To>(
  idExtractor: IdExtractor<T | To>,
  mainTable: Iterable<T>,
  ...otherTables: Iterable<To>[]
): IterableIterator<[T, ...(To | null)[]]> {
  const indices = otherTables.map((table) => {
    const index = new Map<unknown, To>();
    for (const record of table) {
      index.set(idExtractor(record), record);
    }
    return index;
  });

  for (const record of mainTable) {
    const id = idExtractor(record);
    const row: [T, ...(To | null)[]] = [
      record,
      ...indices.map((index) => index.get(id) || null),
    ];
    yield row;
  }
} as any;
