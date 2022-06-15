import { asNonTrimmedString, asTrimmedString } from './utils';

export class RuleDTO {
  public disabled: string;
  public name: string;
  public flavorizationLevel: string;
  public match: string;
  public modifiers: string;
  public partOfSpeech: string;
  public genesis: string;
  public readonly replacements: Array<string> = [];

  constructor(record: Record<string, unknown>) {
    this.disabled = asTrimmedString(record.disabled);
    this.name = asTrimmedString(record.name);
    this.match = asNonTrimmedString(record.match);
    this.flavorizationLevel = asTrimmedString(record.flavorizationLevel);
    this.modifiers = asTrimmedString(record.modifiers);
    this.partOfSpeech = asTrimmedString(record.partOfSpeech);
    this.genesis = asTrimmedString(record.genesis);

    for (let i = 1; Reflect.has(record, `replacement${i}`); i++) {
      const value = asNonTrimmedString(record[`replacement${i}`]);

      if (value) {
        if (value === 'NULL') {
          this.replacements.push('');
        } else {
          this.replacements.push(value);
        }
      }
    }
  }

  public toJSON() {
    const result: Record<string, unknown> = {
      disabled: this.disabled,
      name: this.name,
      flavorizationLevel: this.flavorizationLevel,
      match: this.flavorizationLevel,
      modifiers: this.flavorizationLevel,
      partOfSpeech: this.flavorizationLevel,
      genesis: this.flavorizationLevel,
    };

    for (let i = 0; i < this.replacements.length; i++) {
      result[`replacement${i + 1}`] = this.replacements[i] || 'NULL';
    }

    return result;
  }

  static from(r: Record<string, unknown>): RuleDTO {
    return new RuleDTO(r);
  }
}
