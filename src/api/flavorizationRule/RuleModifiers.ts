export class RuleModifiers {
  public fixed = false;
  public case?: 'upper' | 'lower';
  public map = false;
  public split?: 'by-word' | 'by-letter' = undefined;

  toString() {
    if (this.case) {
      return this.case.toUpperCase();
    }

    return [
      this.fixed ? 'FIXED' : '',
      this.map ? 'MAP' : '',
      this.split ? this.split.toUpperCase() : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  public static parse(value: string) {
    const result = new RuleModifiers();
    if (!value) {
      return result;
    }

    const flags = new Set(value.toLowerCase().split(/\s+/));
    result.fixed = flags.has('fixed');
    result.map = flags.has('map');
    if (flags.has('by-word')) {
      result.split = 'by-word';
    } else if (flags.has('by-letter')) {
      result.split = 'by-letter';
    } else if (flags.has('upper')) {
      result.case = 'upper';
    } else if (flags.has('lower')) {
      result.case = 'lower';
    }

    return result;
  }

  public static readonly none = Object.freeze(new RuleModifiers());
}
