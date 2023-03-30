import { Executor, Rule } from '../../multireplacer';

export type ExecutorCallback = (rule: Rule<any>) => Executor<any>;
