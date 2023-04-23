export abstract class SyncOperation<Clean, Dirty = Clean> {
  protected abstract getBefore(): Promise<Clean[]>;
  protected abstract getAfter(): Promise<Dirty[]>;
  protected abstract extractIdBefore(record: Clean): string;
  protected abstract extractIdAfter(record: Dirty): string;
  protected abstract insert(record: Dirty): Promise<void>;
  protected abstract update(
    beforeRecord: Clean,
    afterRecord: Dirty,
  ): Promise<void>;
  protected abstract delete(record: Clean): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async beginTransaction(): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async rollbackTransaction(): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async commit(): Promise<void> {}

  async execute(): Promise<void> {
    await this.beginTransaction?.();

    try {
      const beforeRecords = await this.getBefore();
      const afterRecords = await this.getAfter();

      const beforeMap = new Map(
        beforeRecords.map((r) => [this.extractIdBefore(r), r]),
      );
      const afterMap = new Map(
        afterRecords.map((r) => [this.extractIdAfter(r), r]),
      );

      const toInsert = afterRecords.filter(
        (r) => !beforeMap.has(this.extractIdAfter(r)),
      );
      const toUpdate = afterRecords.filter((r) =>
        beforeMap.has(this.extractIdAfter(r)),
      );
      const toDelete = beforeRecords.filter(
        (r) => !afterMap.has(this.extractIdBefore(r)),
      );

      for (const r of toInsert) {
        await this.insert(r);
      }

      for (const r of toUpdate) {
        await this.update(beforeMap.get(this.extractIdAfter(r))!, r);
      }

      for (const r of toDelete) {
        await this.delete(r);
      }

      await this.commit?.();
    } catch (error) {
      await this.rollbackTransaction?.();
      throw error;
    }
  }
}
