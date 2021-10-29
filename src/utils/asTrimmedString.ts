export function asTrimmedString(s: unknown): string {
  return `${s || ''}`.trim().normalize('NFC');
}

export function asNonTrimmedString(s: unknown): string {
  return `${s || ''}`.normalize('NFC');
}
