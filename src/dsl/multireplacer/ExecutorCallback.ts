import { Executor, Rule } from '@interslavic/odometer';

export type ExecutorCallback = (rule: Rule<any>) => Executor<any>;
