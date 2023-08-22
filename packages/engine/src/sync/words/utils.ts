export function isBeta(dto: { readonly id: string | number }): boolean {
  return dto.id >= 37_000;
}
