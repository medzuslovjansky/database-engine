import {
  Intermediate,
  Multireplacer,
  Predicate,
  ObjectPredicateWrapper,
  Rule,
  RegExpExecutor,
  MapExecutor,
  FunctionExecutor,
} from '..';

type TestContext = {
  isOkay: boolean;
  isBad: boolean;
};

class TestIntermediate extends Intermediate<TestContext> {}

describe('Multireplacer', () => {
  test('predicates', () => {
    const predicateFn: Predicate<TestContext> = (x) =>
      Boolean(x.context?.isBad);

    const predicateObj = new ObjectPredicateWrapper(predicateFn, false);

    const intermediate = new TestIntermediate('good', {
      isOkay: true,
      isBad: false,
    });

    expect(predicateFn(intermediate)).toBe(false);
    expect(predicateObj.appliesTo(intermediate)).toBe(true);
  });

  function regexpRule(name: string, regexp: RegExp, replacements: any[]) {
    const rule = new Rule<TestContext>(name);
    const executor = new RegExpExecutor(
      regexp,
      replacements.map((r) => rule.authorReplacement(r)),
    );

    rule.executor = executor;
    return rule;
  }

  function mapperRule(
    name: string,
    map: Record<string, string>,
    capitalize: boolean,
  ) {
    const rule = new Rule<TestContext>(name);
    rule.executor = new MapExecutor(rule.authorReplacement(map), capitalize);

    return rule;
  }

  function fnRule(name: string, fn: any) {
    const rule = new Rule<TestContext>(name);
    rule.executor = new FunctionExecutor(rule.authorReplacement(fn));

    return rule;
  }

  test('regexpRule', () => {
    const rule = regexpRule('1', /[aeiovuy]+/, [
      '',
      (match: string) => `${match}^${match.length}`,
    ]);

    expect(rule.name).toBe('1');

    rule.predicates
      .or((x) => !x.context?.isOkay)
      .or((x) => x.context?.isBad)
      .not();

    const intermediate = new TestIntermediate('zovati', {
      isOkay: true,
      isBad: false,
    });

    const replacementObjects = [...rule.replacements];
    for (const obj of replacementObjects) {
      expect(obj.owner).toBe(rule);
    }

    const [r1, r2, r3, r4] = rule.apply(intermediate);

    expect(r1.parent?.parent).toBe(intermediate);
    expect(r1.context).toBe(intermediate.context);
    expect(r1.via).toBe(replacementObjects[0]);
    expect(r1.value).toBe('zt');

    expect(r2.parent?.parent).toBe(intermediate);
    expect(r2.context).toBe(intermediate.context);
    expect(r2.via).toBe(replacementObjects[1]);
    expect(r2.value).toBe('zti^1');

    expect(r3.parent?.parent).toBe(intermediate);
    expect(r3.context).toBe(intermediate.context);
    expect(r3.via).toBe(replacementObjects[0]);
    expect(r3.value).toBe('zova^3t');

    expect(r4.parent?.parent).toBe(intermediate);
    expect(r4.context).toBe(intermediate.context);
    expect(r4.via).toBe(replacementObjects[1]);
    expect(r4.value).toBe('zova^3ti^1');

    const multireplacer = new Multireplacer<TestContext>();
    multireplacer.rules.add(rule);

    const variants = multireplacer.process(
      [intermediate.value],
      intermediate.context,
    );

    expect(
      [r1, r2, r3, r4].every((r, i) => r.equals(variants[i])),
    ).toBeTruthy();

    expect(() => multireplacer.rules.add(rule)).toThrowError(/already added/);
    expect(multireplacer.rules.find(rule)).toBe(rule);
    expect(multireplacer.rules.find(r1.via)).toBe(rule);
    expect(multireplacer.rules.find(r2.via)).toBe(rule);
    expect(multireplacer.rules.find(r3.via)).toBe(rule);
    expect(multireplacer.rules.find(r4.via)).toBe(rule);
    expect(multireplacer.rules.find(null)).toBe(null);

    const otherVariants = multireplacer.process(['bad'], {
      isOkay: true,
      isBad: true,
    });

    expect(otherVariants.length).toBe(1);
    expect(otherVariants[0].parent).toBe(null);
  });

  test('mapperRule', () => {
    const rule = mapperRule(
      'Polish',
      {
        č: 'cz',
        š: 'sz',
        ŕ: 'rz',
        ě: 'ie',
        v: 'w',
      },
      true,
    );

    const word = new TestIntermediate('Gŕegoŕ Bŕęčyščykěvič', {
      isOkay: true,
      isBad: false,
    });

    const [polish] = rule.apply(word);
    expect(polish.value).toBe('Grzegorz Brzęczyszczykiewicz');
  });

  test('fnRule', () => {
    const rule = fnRule('updown', (s: TestIntermediate) => {
      return [s.value.toUpperCase(), s.value.toLowerCase()];
    });

    const word = new TestIntermediate('Gregorz', {
      isOkay: true,
      isBad: false,
    });

    const [up, low] = rule.apply(word);
    expect(up.value).toBe('GREGORZ');
    expect(low.value).toBe('gregorz');
  });
});
