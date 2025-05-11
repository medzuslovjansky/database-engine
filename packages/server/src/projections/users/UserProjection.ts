import { Projection } from '../base';
import type { TypedEvent } from '@app/schema';

/**
 * Projection that maintains the users table based on user events
 */
export class UserProjection extends Projection {
  /**
   * Register event handlers for user events
   */
  protected registerHandlers(): void {
    this.subscribe('UserCreated', this.handleUserCreated.bind(this));
    this.subscribe('UserRoleAdded', this.handleUserRoleAdded.bind(this));
    this.subscribe('UserRoleRemoved', this.handleUserRoleRemoved.bind(this));
    this.subscribe('UserUpdated', this.handleUserUpdated.bind(this));
    // Add more event handlers as needed, e.g.:
    // this.subscribe('UserDeleted', this.handleUserDeleted);
  }

  /**
   * Handle UserCreated events by creating a user in the users table
   */
  private async handleUserCreated(event: TypedEvent<'UserCreated'>): Promise<void> {
    console.log('[UserProjection] handleUserCreated called', event);
    const { id, display_name, email, created_at, last_login } = event.payload;
    const timestamp = event.timestamp || Date.now();

    console.log('[UserProjection] Inserting user into users table:', { id, display_name, email, timestamp });
    await this.db
      .prepare(`
        INSERT INTO users (
          id, display_name, email, created_at, last_login
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        display_name,
        email,
        created_at || timestamp,
        last_login || timestamp
      )
      .run();
    console.log('[UserProjection] Inserted user:', id);
  }

  /**
   * Handle UserRoleAdded events by inserting into user_roles table
   */
  private async handleUserRoleAdded(event: TypedEvent<'UserRoleAdded'>): Promise<void> {
    const { user_id, role, language_code = 'mul' } = event.payload;
    await this.db
      .prepare(
        'INSERT OR IGNORE INTO user_roles (user_id, role_id, language_code) VALUES (?, ?, ?)'
      )
      .bind(user_id, role, language_code)
      .run();
  }

  /**
   * Handle UserRoleRemoved events by deleting from user_roles table
   */
  private async handleUserRoleRemoved(event: TypedEvent<'UserRoleRemoved'>): Promise<void> {
    const { user_id, role, language_code = 'mul' } = event.payload;
    await this.db
      .prepare(
        'DELETE FROM user_roles WHERE user_id = ? AND role_id = ? AND language_code = ?'
      )
      .bind(user_id, role, language_code)
      .run();
  }

  private async handleUserUpdated(event: TypedEvent<'UserUpdated'>): Promise<void> {
    const { id, display_name } = event.payload;
    await this.db
      .prepare('UPDATE users SET display_name = ? WHERE id = ?')
      .bind(display_name, id)
      .run();
  }

  /**
   * Clear the users table for rebuilding
   */
  protected async clearTable(): Promise<void> {
    await this.db.exec('DELETE FROM users');
  }
}
