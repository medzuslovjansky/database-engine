export interface CryptoService {
  decrypt(value: string): string;
  encrypt(value: string): string;
}
