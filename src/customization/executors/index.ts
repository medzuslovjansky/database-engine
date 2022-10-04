import identity from 'lodash/identity';
import upperFirst from 'lodash/upperFirst';
import toLower from 'lodash/toLower';
import toUpper from 'lodash/toUpper';
import { FunctionExecutor, Rule } from '../../multireplacer';
import { FlavorizationContext } from '../FlavorizationContext';
import { FlavorizationIntermediate } from '../FlavorizationIntermediate';

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

      if (!restoreFns) {
        return [r.value];
      } else {
        return [
          r.value.replace(
            BY_WORD,
            _restoreCaseFromMemo.bind(restoreFns.slice()),
          ),
        ];
      }
    }),
  );

function _toLowerCaseWithMemo(this: StringTransformer[], s: string): string {
  const lower = toLower(s);

  if (s === lower) {
    this.push(identity);
    return lower;
  } else if (s === upperFirst(lower)) {
    this.push(upperFirst);
    return lower;
  } else if (s === toUpper(lower)) {
    this.push(toUpper);
    return lower;
  } else {
    this.push(identity);
    return s;
  }
}

function _restoreCaseFromMemo(this: StringTransformer[], s: string): string {
  const fn = this.shift();
  return fn ? fn(s) : s;
}
