import _ from 'lodash';

import type { Rule } from '../../multireplacer';
import { FunctionExecutor } from '../../multireplacer';
import type { FlavorizationContext } from '../FlavorizationContext';
import type { FlavorizationIntermediate } from '../FlavorizationIntermediate';

type StringTransformer = (s: string) => string;

const caseMemory = new WeakMap<
  FlavorizationIntermediate,
  StringTransformer[]
>();

const BY_WORD = /\p{Letter}+/gu;

export const lowerCase = (rule: Rule<FlavorizationContext>) =>
  new FunctionExecutor(
    rule.authorReplacement((r: FlavorizationIntermediate) => {
      const restoreFns: StringTransformer[] = [];
      caseMemory.set(r, restoreFns);
      return [r.value.replace(BY_WORD, _toLowerCaseWithMemo.bind(restoreFns))];
    }),
  );

export const restoreCase = (rule: Rule<FlavorizationContext>) =>
  new FunctionExecutor(
    rule.authorReplacement((r: FlavorizationIntermediate) => {
      let restoreFns = r.root ? caseMemory.get(r.root) : undefined;
      let head = r;

      while (!restoreFns && head.parent) {
        restoreFns = caseMemory.get(head);
        head = head.parent;
      }

      return restoreFns
        ? [r.value.replace(BY_WORD, _restoreCaseFromMemo.bind([...restoreFns]))]
        : [r.value];
    }),
  );

function _toLowerCaseWithMemo(this: StringTransformer[], s: string): string {
  const lower = _.toLower(s);

  switch (s) {
    case lower: {
      this.push(_.identity);
      return lower;
    }
    case _.upperFirst(lower): {
      this.push(_.upperFirst);
      return lower;
    }
    case _.toUpper(lower): {
      this.push(_.toUpper);
      return lower;
    }
    default: {
      this.push(_.identity);
      return s;
    }
  }
}

function _restoreCaseFromMemo(this: StringTransformer[], s: string): string {
  const fn = this.shift();
  return fn ? fn(s) : s;
}
