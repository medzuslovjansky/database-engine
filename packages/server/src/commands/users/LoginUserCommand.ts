import { User } from '@app/schema';
import { generateUuid5 } from '@app/utils';
import { FindUserQuery } from '@app/queries';
import { commandRegistry, eventRegistry, CommandPayload } from '@app/schema';
import { BaseCommand, BaseCommandConfig } from '../base';
import { UserService } from '@app/auth';

export interface LoginUserCommandConfig extends BaseCommandConfig<'LoginUser'> {
  userService: UserService;
}

/**
 * Command to login a user, creating them if they don't exist
 * Side effects: Records command on error, creates new user if not exists
 */
export class LoginUserCommand extends BaseCommand<'LoginUser', void> {
  private userService: UserService;

  constructor(config: LoginUserCommandConfig) {
    super(commandRegistry.LoginUser, config);
    this.userService = config.userService;
  }

  protected async doExecute(payload: CommandPayload<'LoginUser'>): Promise<void> {
    console.log('[LoginUserCommand] doExecute called', payload);
    const { email, display_name } = payload;
    if (!email) throw new Error('Email is required');
    const existingUser = await this.findUser({ email });
    if (existingUser) {
      console.log('[LoginUserCommand] User already exists:', existingUser);
    } else {
      const isFirstUser = !(await this.userService.hasAnyUsers());
      const id = generateUuid5(email);
      console.log('[LoginUserCommand] Creating new user with id:', id);
      await this.recordEvent(
        eventRegistry.UserCreated,
        id,
        {
          id,
          display_name,
          email,
          created_at: Date.now(),
          last_login: Date.now(),
        } as any // Temporary cast to bypass type error until event schema is updated
      );
      console.log('[LoginUserCommand] UserCreated event recorded for:', email);
      if (isFirstUser) {
        await this.recordEvent(
          eventRegistry.UserRoleAdded,
          id,
          {
            user_id: id,
            role: 'admin',
            language_code: 'mul',
          }
        );
        console.log('[LoginUserCommand] First user, admin role assigned:', email);
      }
    }
  }

  /**
   * Find a user by ID or email
   */
  private async findUser(params: { userId?: string; email?: string }): Promise<User | null> {
    const findUserQuery = new FindUserQuery(this.db);
    return await findUserQuery.execute(params);
  }
}
