import { NOT_AUTHENTICATED, SlovosborError } from '@app/errors';
import { commandRegistry } from '@app/schema';

import { BaseCommand, BaseCommandConfig } from '../base';

/**
 * Command to update a user's last login timestamp
 */
export class UpdateLastLoginCommand extends BaseCommand<'UpdateLastLogin', void> {
	constructor(config: BaseCommandConfig<'UpdateLastLogin'>) {
		super(commandRegistry.UpdateLastLogin, config);
	}

	protected async doExecute(): Promise<void> {
		if (!this.user) throw new SlovosborError(NOT_AUTHENTICATED);

		await this.db
			.prepare('UPDATE users SET last_login = ? WHERE id = ?')
			.bind(Date.now(), this.user.id)
			.run();
	}
}
