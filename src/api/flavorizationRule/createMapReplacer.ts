export default function createMapReplacer(
  replacement: string,
): Record<string, string> {
  return replacement.split(/\s+/).reduce((record, pair) => {
    const [key, value] = pair.split('-', 2);
    record[key] = value;
    return record;
  }, {} as Record<string, string>);
}
