import type { User } from '../../dto';
import { YamlSerializer } from '../../fs';
import type { PIIHelper } from '../../utils';

export class UserSerializer extends YamlSerializer<string, User> {
  constructor(private readonly piiHelper: PIIHelper) {
    super();
  }

  async serialize(entityPath: string, entity: User): Promise<void> {
    const copy = { ...entity };
    copy.email = this.piiHelper.encrypt(copy.email);
    return super.serialize(entityPath, copy);
  }

  async deserialize(entityPath: string): Promise<User> {
    const raw = await super.deserialize(entityPath);
    raw.email = this.piiHelper.decrypt(raw.email);
    return raw;
  }
}
