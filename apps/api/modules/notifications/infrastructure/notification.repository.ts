import type {
  INotificationRepository,
  NotificationPage,
  NotificationPaginationFilter,
} from '@ecomerece/domain';
import { NotificationAggregate } from '@ecomerece/domain';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError } from '../../../errors/app-error';
import { NotificationMapper } from './notification.mapper';
import { NotificationModel, type NotificationPersistence } from './notification.model';

export class NotificationRepository
  extends MongoRepository<NotificationPersistence>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  async FindById(id: Id): Promise<NotificationAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return NotificationMapper.persistenceToAggregate(doc);
  }

  async Create(notification: NotificationAggregate): Promise<void> {
    await super.create(
      new NotificationModel(NotificationMapper.aggregateToPersistence(notification)),
    );
  }

  async Save(notification: NotificationAggregate): Promise<void> {
    const data = NotificationMapper.aggregateToPersistence(notification);

    const result = await super.updateOne(
      { _id: notification.id.value, version: notification.version.value },
      { $set: data, $inc: { version: 1 } },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async CountUnread(userId: Id): Promise<number> {
    return super.count({
      userId: userId.value,
      isRead: false,
      'deleted.deleted': false,
    });
  }

  /** One bulk write for "mark all read"; the client never pages through them. */
  async MarkAllRead(userId: Id): Promise<number> {
    const result = await super.updateMany(
      { userId: userId.value, isRead: false, 'deleted.deleted': false },
      { $set: { isRead: true, readAt: new Date() }, $inc: { version: 1 } },
    );

    return result.modifiedCount;
  }

  async FindPaginated(params: {
    filter?: NotificationPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<NotificationPage> {
    const result = await this.paginateByCursor({
      filter: this.buildFilter(params.filter),
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    return {
      data: result.data.map((doc: NotificationPersistence) =>
        NotificationMapper.persistenceToAggregate(doc),
      ),
      meta: result.meta,
    };
  }

  private buildFilter(filter?: NotificationPaginationFilter): FilterQuery<NotificationPersistence> {
    const query: FilterQuery<NotificationPersistence> = {
      'deleted.deleted': filter?.deleted ?? false,
    };

    if (filter?.userId) query.userId = filter.userId;
    if (filter?.type) query.type = filter.type;
    if (filter?.isRead !== undefined) query.isRead = filter.isRead;

    return query;
  }
}
