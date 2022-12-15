export type SyncParams<T> = {
  getBefore: () => Promise<T[]>;
  getAfter: () => Promise<T[]>;
  extractId: (r: T) => string;
  insert: (r: T) => Promise<void>;
  update: (before: T, after: T) => Promise<void>;
  delete: (r: T) => Promise<void>;
};

export async function sync<T>(params: SyncParams<T>): Promise<void> {
  const beforeRecords = await params.getBefore();
  const afterRecords = await params.getAfter();

  const beforeMap = new Map(beforeRecords.map((r) => [params.extractId(r), r]));
  const afterMap = new Map(afterRecords.map((r) => [params.extractId(r), r]));

  const toInsert = afterRecords.filter(
    (r) => !beforeMap.has(params.extractId(r)),
  );
  const toUpdate = afterRecords.filter((r) =>
    beforeMap.has(params.extractId(r)),
  );
  const toDelete = beforeRecords.filter(
    (r) => !afterMap.has(params.extractId(r)),
  );

  for (const r of toInsert) {
    await params.insert(r);
  }

  for (const r of toUpdate) {
    await params.update(beforeMap.get(params.extractId(r))!, r);
  }

  for (const r of toDelete) {
    await params.delete(r);
  }
}
