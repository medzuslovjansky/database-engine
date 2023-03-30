import { Rule } from './Rule';

export class Replacement<Value = unknown, Context = unknown> {
  constructor(
    public readonly owner: Rule<Context>,
    public readonly value: Value,
  ) {}

  public get index(): number {
    return this.owner.indexOf(this);
  }

  [Symbol.toStringTag](): string {
    return String(this.value);
  }
}
