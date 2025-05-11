import { canEditUserRole, UserService } from '@app/auth';
import { SlovosborError, NOT_AUTHENTICATED, NOT_AUTHORIZED } from '@app/errors';
import { commandRegistry, eventRegistry, RemoveUserRoleCommandPayload } from '@app/schema';
import { BaseCommand, BaseCommandConfig } from '../base';

export interface RemoveUserRoleCommandConfig extends BaseCommandConfig<'RemoveUserRole'> {
  userService: UserService;
}

/**
 * Command for removing a role from a user
 */
export class RemoveUserRoleCommand extends BaseCommand<'RemoveUserRole', void> {
  private userService: UserService;

  constructor(config: RemoveUserRoleCommandConfig) {
    super(commandRegistry.RemoveUserRole, config);
    this.userService = config.userService;
  }

  protected async doExecute(params: RemoveUserRoleCommandPayload): Promise<void> {
    if (!this.user) throw new SlovosborError(NOT_AUTHENTICATED);

    const { user_id, role, language_code = 'mul' } = params;
    if (!canEditUserRole(this.user, role, language_code)) throw new SlovosborError(NOT_AUTHORIZED);

    await this.recordEvent(
      eventRegistry.UserRoleRemoved,
      this.user.id,
      { user_id, role, language_code }
    );

    this.userService.invalidateUser({ id: user_id });
  }
}
