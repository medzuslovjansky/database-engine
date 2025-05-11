import { canEditUserRole, UserService } from '@app/auth';
import { SlovosborError, NOT_AUTHENTICATED, NOT_AUTHORIZED } from '@app/errors';
import { AddUserRoleCommandPayload, Role, commandRegistry, eventRegistry } from '@app/schema';
import { BaseCommand, BaseCommandConfig } from '../base';

export interface AddUserRoleCommandConfig extends BaseCommandConfig<'AddUserRole'> {
  userService: UserService;
}

/**
 * Command for adding a role to a user
 */
export class AddUserRoleCommand extends BaseCommand<'AddUserRole', void> {
  private userService: UserService;

  constructor(config: AddUserRoleCommandConfig) {
    super(commandRegistry.AddUserRole, config);
    this.userService = config.userService;
  }

  protected async doExecute(params: AddUserRoleCommandPayload): Promise<void> {
    if (!this.user) throw new SlovosborError(NOT_AUTHENTICATED);

    const { user_id, role, language_code = 'mul' } = params;
    if (!canEditUserRole(this.user, role as Role, language_code)) throw new SlovosborError(NOT_AUTHORIZED);
    await this.recordEvent(
      eventRegistry.UserRoleAdded,
      this.user.id,
      { user_id, role, language_code }
    );
    this.userService.invalidateUser({ id: user_id });
  }
}

