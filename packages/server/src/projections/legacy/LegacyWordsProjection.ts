import { Projection } from '../base';
import type { TypedEvent } from '@app/schema/system/event';

/**
 * Projection that maintains the legacy_words table based on SteenEntryImported events
 */
export class LegacyWordsProjection extends Projection {
  /**
   * Register event handlers for legacy word events
   */
  protected registerHandlers(): void {
    this.subscribe('SteenEntryImported', this.handleSteenEntryImported.bind(this));
    this.subscribe('SteenEntryRemoved', this.handleSteenEntryRemoved.bind(this));
    // Add more event handlers as needed
  }

  /**
   * Handle SteenEntryImported events by upserting into legacy_words table
   */
  private async handleSteenEntryImported(event: TypedEvent<'SteenEntryImported'>): Promise<void> {
    const payload = event.payload;
    console.log('[LegacyWordsProjection] handleSteenEntryImported called with payload:', payload);
    const id = Math.abs(payload.id);
    const source = payload.source;
    // 'changes' is not part of the schema, but may be present in the payload
    const changes = (payload as any).changes || {};
    const updateFields = Object.keys(changes);
    let beta: number | undefined = undefined;
    if (source === 'words') {
      beta = payload.id < 0 ? 1 : 0;
      updateFields.push('beta');
      changes['beta'] = beta;
    }
    if (updateFields.length === 0) {
      console.log('[LegacyWordsProjection] No fields to update for id:', id);
      return; // nothing to update
    }
    const columns = ['id', ...updateFields];
    const placeholders = columns.map(() => '?').join(', ');
    const updateAssignments = updateFields.map(f => `${f} = excluded.${f}`).join(', ');
    const values = [id, ...updateFields.map(f => changes[f])];
    console.log('[LegacyWordsProjection] Inserting/updating legacy_words with values:', values);
    await this.db.prepare(
      `INSERT INTO legacy_words (${columns.join(', ')}) VALUES (${placeholders})
       ON CONFLICT(id) DO UPDATE SET ${updateAssignments}`
    ).bind(...values).run();
    console.log('[LegacyWordsProjection] Insert/update complete for id:', id);
  }

  /**
   * Handle SteenEntryRemoved events by deleting from legacy_words table
   */
  private async handleSteenEntryRemoved(event: TypedEvent<'SteenEntryRemoved'>): Promise<void> {
    const payload = event.payload;
    console.log('[LegacyWordsProjection] handleSteenEntryRemoved called with payload:', payload);
    const id = Math.abs(payload.id);
    console.log('[LegacyWordsProjection] Deleting from legacy_words where id =', id);
    await this.db.prepare(
      'DELETE FROM legacy_words WHERE id = ?'
    ).bind(id).run();
    console.log('[LegacyWordsProjection] Delete complete for id:', id);
  }

  /**
   * Clear the legacy_words table for rebuilding
   */
  protected async clearTable(): Promise<void> {
    await this.db.exec('DELETE FROM legacy_words');
  }
}
