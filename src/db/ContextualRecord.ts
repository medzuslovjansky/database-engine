export interface ContextualRecord<T> {
  dto: T;
  rowIndex: number;
  tableName: string;
}
