import { RuleDTO } from '../RuleDTO';
import createMapReplacer from '../utils/createMapReplacer';
import { comment, indent, J, J2, Js } from './helpers';

export default function generateCode(
  name: string,
  rules: Record<string, unknown>[],
) {
  return [...generateYield(name, rules.map(RuleDTO.from))].join('\n');
}

function* generateYield(
  name: string,
  rules: RuleDTO[],
): IterableIterator<string> {
  yield "import multireplacer from '../../dsl/multireplacer';\n";
  yield 'export default () => multireplacer';
  yield indent`.named(${Js(name)})`;

  let lastSection: unknown;
  for (const rule of rules) {
    if (rule.disabled === 'SECTION') {
      if (lastSection) {
        yield indent`//#endregion`;
      }

      yield indent`//#region ${rule.name}`;
      yield indent`.section(${Js(rule.name)})`;
      lastSection = rule;
    } else {
      if (rule.flavorizationLevel.includes('E')) {
        for (const line of formatRule(rule)) {
          yield indent`${isDisabled(rule) ? comment`${line}` : line}`;
        }
      }
    }
  }

  if (lastSection) {
    yield indent`//#endregion`;
  }

  yield '  .build();\n';
}

function isDisabled(rule: RuleDTO) {
  return (
    rule.disabled ||
    !rule.name ||
    !rule.match ||
    (rule.modifiers === 'regexp' && rule.replacements.length === 0)
  );
}

function formatPredicates(rule: RuleDTO) {
  return joinPredicates(
    rule.partOfSpeech ? J`p.partOfSpeech(${rule.partOfSpeech})` : '',
    rule.genesis ? J`p.genesis(${rule.genesis})` : '',
  );
}

function joinPredicates(p1?: string, p2?: string) {
  return p1 && p2 ? `${p1}.and(${p2})` : p1 || p2 || '';
}

function formatExecutor(rule: RuleDTO) {
  switch (rule.modifiers) {
    case 'regexp':
      return J`r.regexp(${new RegExp(rule.match)}, ${rule.replacements})`;
    case 'map':
      return J2`r.map(${createMapReplacer(rule.match)})`;
    default:
      return `r.${rule.modifiers}()`;
  }
}

function* formatRule(rule: RuleDTO) {
  yield '.rule(';
  yield indent`${Js(rule.name)},`;

  const executorLine = formatExecutor(rule);
  if (executorLine) {
    yield indent`(r) => ${executorLine},`;
  }

  const predicateLine = formatPredicates(rule);
  if (predicateLine) {
    yield indent`(p) => ${predicateLine}`;
  }

  yield ')';
}
