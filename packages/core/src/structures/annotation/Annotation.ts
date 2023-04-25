export type AnnotationOptions = {
  value: string;
};

export class Annotation {
  constructor(options: Partial<AnnotationOptions> = {}) {
    this.value = options.value || '';
  }

  public value: string;

  public clone(): Annotation {
    return new Annotation({
      value: this.value,
    });
  }

  public toString(): string {
    return this.value;
  }

  static fromString(value: string): Annotation {
    return new Annotation({ value });
  }
}
