import type { User } from '../../dto';
import { YamlSerializer } from '../../fs';
import type { CryptoService } from '../../types';

export class UserSerializer extends YamlSerializer<string, User> {
  constructor(private readonly cryptoService: CryptoService) {
    super();
  }

  async serialize(entityPath: string, entity: User): Promise<void> {
    const copy = { ...entity };
    copy.email = this.cryptoService.encrypt(copy.email);
    return super.serialize(entityPath, copy);
  }

  async deserialize(entityPath: string): Promise<User> {
    const raw = await super.deserialize(entityPath);
    raw.email = this.cryptoService.decrypt(raw.email);
    return raw;
  }
}
