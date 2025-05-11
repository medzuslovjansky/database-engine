import { BaseQuery } from '../base';

export class CountUsersQuery extends BaseQuery<undefined, number> {
  async execute(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    return result?.count ?? 0;
  }
}
