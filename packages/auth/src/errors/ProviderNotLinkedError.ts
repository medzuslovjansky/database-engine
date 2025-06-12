export class ProviderNotLinkedError extends Error {
  constructor(message: string = 'Provider not linked to any user') {
    super(message);
    this.name = 'ProviderNotLinkedError';
  }
}
