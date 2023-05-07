export class NoCryptoService {
  public encrypt(value: string): string {
    return value;
  }

  public decrypt(value: string): string {
    return value;
  }
}
