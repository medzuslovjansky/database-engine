export function isBeta(dto: { readonly id: string | number }): boolean {
  return Math.abs(+dto.id) >= 37_000;
}
