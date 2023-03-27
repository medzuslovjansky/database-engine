export type SyncParams<Clean, Dirty = Clean> = {
  getBefore: () => Promise<Clean[]>;
  getAfter: () => Promise<Dirty[]>;
  extractIdBefore: (r: Clean) => string;
  extractIdAfter: (r: Dirty) => string;
  beginTransaction?: () => Promise<void>;
  insert: (r: Dirty) => Promise<void>;
  update: (before: Clean, after: Dirty) => Promise<void>;
  delete: (r: Clean) => Promise<void>;
  commit?: () => Promise<void>;
};

export async function genericSync<Clean, Dirty>(
  params: SyncParams<Clean, Dirty>,
): Promise<void> {
  await params.beginTransaction?.();

  const beforeRecords = await params.getBefore();
  const afterRecords = await params.getAfter();

  const beforeMap = new Map(
    beforeRecords.map((r) => [params.extractIdBefore(r), r]),
  );
  const afterMap = new Map(
    afterRecords.map((r) => [params.extractIdAfter(r), r]),
  );

  const toInsert = afterRecords.filter(
    (r) => !beforeMap.has(params.extractIdAfter(r)),
  );
  const toUpdate = afterRecords.filter((r) =>
    beforeMap.has(params.extractIdAfter(r)),
  );
  const toDelete = beforeRecords.filter(
    (r) => !afterMap.has(params.extractIdBefore(r)),
  );

  for (const r of toInsert) {
    await params.insert(r);
  }

  for (const r of toUpdate) {
    await params.update(beforeMap.get(params.extractIdAfter(r))!, r);
  }

  for (const r of toDelete) {
    await params.delete(r);
  }

  await params.commit?.();
}
