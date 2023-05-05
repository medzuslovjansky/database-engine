/* eslint-disable @typescript-eslint/no-empty-function */

export abstract class EntitySyncOperation<Before, After = Before> {
  protected abstract getBefore(): Promise<Before[]>;
  protected abstract getAfter(): Promise<After[]>;
  protected abstract extractIdBefore(record: Before): unknown;
  protected abstract extractIdAfter(record: After): unknown;
  protected abstract insert(record: After): Promise<void>;
  protected abstract update(
    beforeRecord: Before,
    afterRecord: After,
  ): Promise<void>;
  protected abstract delete(record: Before): Promise<void>;

  protected async beginTransaction(): Promise<void> {}
  protected async rollbackTransaction(): Promise<void> {}
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
