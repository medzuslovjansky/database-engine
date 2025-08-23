  import type { AssignRoleRequest, UnassignRoleRequest } from '@core/schema';
import type { UserAggregate } from '@core/aggregates';
import { AggregateNotFoundError } from '@interslavic/database-engine-errors';
import type { AggregateRepository, UnitOfWork } from '@interslavic/database-engine-eventstore';

export interface UserControllerConfig {
  readonly aggregateRepository: AggregateRepository;
  readonly unitOfWork: UnitOfWork;
}

export class UserController {
  constructor(private readonly config: UserControllerConfig) {}

  async assignRole(request: AssignRoleRequest): Promise<void> {
    const streamId = `users/${request.userId}`;
    const userAggregate = await this.config.aggregateRepository.load<UserAggregate>(streamId);
    if (!userAggregate) {
      throw new AggregateNotFoundError(streamId);
    }

    userAggregate.assignRole(request.issuerId, request.role, request.language);
    await this.config.aggregateRepository.save(userAggregate);
    await this.config.unitOfWork.commit();
  }

  async unassignRole(request: UnassignRoleRequest): Promise<void> {
    const streamId = `users/${request.userId}`;
    const userAggregate = await this.config.aggregateRepository.load<UserAggregate>(streamId);
    if (!userAggregate) {
      console.warn(`User ${request.userId} not found`);
      return;
    }

    userAggregate.unassignRole(request.issuerId, request.role, request.language);
    await this.config.aggregateRepository.save(userAggregate);
    await this.config.unitOfWork.commit();
  }
}

