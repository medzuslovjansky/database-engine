import identity from 'lodash/identity';
import {
  Multireplacer,
  Predicate,
  PredicateGroup,
  Rule,
} from '../../multireplacer';
import { MultireplacerConfig } from './MultireplacerConfig';
import { MultireplacerRuleBuilder } from './MultireplacerRuleBuilder';
import { MultireplacerPredicateBuilder } from './MultireplacerPredicateBuilder';
import {
  IMultireplacerWrapper,
  MultireplacerWrapper,
} from './MultireplacerWrapper';
import { FlavorizationContext } from '../../customization';

export class MultireplacerBuilder {
  protected multireplacer = new Multireplacer<FlavorizationContext>();
  protected name: string;

  constructor(opts: MultireplacerConfig) {
    this.name = opts.name;
  }

  section(_name: string) {
    return this;
  }

  rule(
    name: string,
    ruleBuilderCallback: (
      r: MultireplacerRuleBuilder,
    ) => MultireplacerRuleBuilder,
    predicateBuilderCallback: (
      p: MultireplacerPredicateBuilder,
    ) => MultireplacerPredicateBuilder = identity,
  ) {
    const ruleBuilder = ruleBuilderCallback(new MultireplacerRuleBuilder());
    const predicateBuilder = predicateBuilderCallback(
      new MultireplacerPredicateBuilder(),
    );

    const rule = new Rule<any>(name);
    if (ruleBuilder.executor) {
      rule.executor = ruleBuilder.executor(rule);
    } else {
      throw new Error(`No executor defined for the rule: ${name}`);
    }

    predicateBuilder.predicates.reduce(
      (g: PredicateGroup<any>, p: Predicate<any>) => g.and(p),
      rule.predicates,
    );

    this.multireplacer.rules.add(rule);
    return this;
  }

  build(): IMultireplacerWrapper {
    return new MultireplacerWrapper(this.name, this.multireplacer);
  }
}
