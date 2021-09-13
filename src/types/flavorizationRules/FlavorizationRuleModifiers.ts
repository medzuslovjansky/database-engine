export class FlavorizationRuleModifiers {
  public fixed = false;
  public map = false;
  public split?: 'by-word' | 'by-letter' = undefined;

  toString() {
    return [
      this.fixed ? 'FIXED' : '',
      this.map ? 'MAP' : '',
      this.split ? this.split.toUpperCase() : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  public static parse(value: string) {
    const result = new FlavorizationRuleModifiers();
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
    }
    return result;
  }

  public static readonly none = Object.freeze(new FlavorizationRuleModifiers());
}
