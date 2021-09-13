type HasString<T> = {
  [P in keyof T]: string;
} & Partial<{
  [key: string]: string;
}>;

export function assertHasProperties<T>(
  obj: unknown,
  keys: (keyof T)[],
): obj is HasString<T> {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Expected obj to be a Record<string, string>.');
  }

  for (const key of keys) {
    const value = (obj as any)[key];
    if (typeof value !== 'string') {
      throw new Error(`Expected .${key} to be a string.`);
    }
  }

  return true;
}
