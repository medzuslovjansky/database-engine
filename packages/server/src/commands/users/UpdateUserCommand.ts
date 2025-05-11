import { BaseCommand, BaseCommandConfig } from '../base';
import { SlovosborError, NOT_AUTHENTICATED } from '@app/errors';
import { commandRegistry, eventRegistry, UpdateUserCommandPayload } from '@app/schema';

/**
 * Command to deliberately update a user's information
 */
export class UpdateUserCommand extends BaseCommand<'UpdateUser', void> {
  constructor(config: BaseCommandConfig<'UpdateUser'>) {
    super(commandRegistry.UpdateUser, config);
  }

  protected async doExecute(payload: UpdateUserCommandPayload): Promise<void> {
    if (!this.user) throw new SlovosborError(NOT_AUTHENTICATED);

    const { id, display_name } = payload;
    if (!display_name) {
      throw new Error('No fields to update');
    }

    await this.recordEvent(
      eventRegistry.UserUpdated,
      this.user?.id,
      { id, display_name } as any // Temporary cast to bypass type error until event schema is updated
    );
  }
}
