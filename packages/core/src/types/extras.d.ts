declare module 'string.prototype.replaceall' {
  type Replacer = (substring: string, ...args: unknown[]) => string;

  export function implementation(
    this: string,
    searchValue: string | RegExp,
    replacer: string | Replacer,
  ): string;
}
