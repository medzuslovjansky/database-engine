const Jgeneric =
  (...options: any[]) =>
  (strings: TemplateStringsArray, ...args: unknown[]) =>
    String.raw(
      strings,
      ...args.map((a) =>
        a instanceof RegExp ? a.toString() : JSON.stringify(a, ...options),
      ),
    );

export const J = Jgeneric();
export const Js = (x: unknown) => JSON.stringify(x);
export const J2 = Jgeneric(null, 2);

const padMultiline = (prefix = '', suffix = '') => {
  return (strings: TemplateStringsArray, ...args: unknown[]) =>
    String.raw(strings, ...args)
      .split('\n')
      .map((s) => prefix + s + suffix)
      .join('\n');
};

export const indent = padMultiline('  ');
export const comment = padMultiline('// ');
