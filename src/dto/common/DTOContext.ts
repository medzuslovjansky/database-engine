export interface DTOContext<T> {
  dto: T;
  rowIndex: number;
  tableName: string;
}
