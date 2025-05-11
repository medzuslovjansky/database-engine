import { BaseCommand, BaseCommandConfig } from '../base';
import { Projections } from '@app/projections';
import { EventBus } from '@app/events/bus';
import { RebuildProjectionsCommandPayload, commandRegistry } from '@app/schema';

/**
 * Command to rebuild projections from events
 */
export class RebuildProjectionsCommand extends BaseCommand<'RebuildProjections', void> {
  constructor(config: BaseCommandConfig<'RebuildProjections'>) {
    super(commandRegistry.RebuildProjections, config);
  }

  protected async doExecute(params: RebuildProjectionsCommandPayload = {}): Promise<void> {
    try {
      // Temporarily disable immediate processing
      EventBus.getInstance().setImmediateProcessing(false);

      // Use projections singleton
      const projections = Projections.getInstance(this.db).getAll();
      const clearTables = params.clearTables ?? true;

      // Filter projections if specific ones are requested
      const projectionsToRebuild = params.projectionNames?.length
        ? projections.filter(p => params.projectionNames?.includes(p.constructor.name))
        : projections;

      // Rebuild each projection
      for (const projection of projectionsToRebuild) {
        await projection.rebuildFromEvents(clearTables);
      }
    } finally {
      // Restore immediate processing
      EventBus.getInstance().setImmediateProcessing(true);
    }
  }
}
