import type {
  IShipmentRepository,
  ShipmentAggregate,
  ShipmentPage,
  ShipmentPaginationFilter,
} from '@ecomerece/domain';
import type { Id, Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { ShipmentMapper } from './shipment.mapper';
import { ShipmentModel, type ShipmentPersistence } from './shipment.model';

export class ShipmentRepository
  extends MongoRepository<ShipmentPersistence>
  implements IShipmentRepository
{
  constructor() {
    super(ShipmentModel);
  }

  async FindById(id: Id): Promise<ShipmentAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return ShipmentMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ShipmentAggregate> {
    const shipment = await this.FindById(id);
    if (!shipment) throw new NotFoundError('Shipment not found.');
    return shipment;
  }

  async FindByTrackingNumber(trackingNumber: string): Promise<ShipmentAggregate | null> {
    const doc = await super.findOne({
      trackingNumber: trackingNumber.trim().toUpperCase(),
      'deleted.deleted': false,
    });
    if (!doc) return null;
    return ShipmentMapper.persistenceToAggregate(doc);
  }

  async FindByOrderId(orderId: Id): Promise<ShipmentAggregate[]> {
    const docs = await super.find({ orderId: orderId.value, 'deleted.deleted': false });
    return docs.map(ShipmentMapper.persistenceToAggregate);
  }

  async Create(shipment: ShipmentAggregate): Promise<void> {
    await super.create(new ShipmentModel(ShipmentMapper.aggregateToPersistence(shipment)));
  }

  async Save(shipment: ShipmentAggregate): Promise<void> {
    const data = ShipmentMapper.aggregateToPersistence(shipment);

    const result = await super.updateOne(
      {
        _id: shipment.id.value,
        version: shipment.version.value,
      },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async FindPaginated(params: {
    filter?: ShipmentPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<ShipmentPage> {
    const result = await this.paginateByCursor({
      filter: this.buildFilter(params.filter),
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    return {
      data: result.data.map((doc: ShipmentPersistence) =>
        ShipmentMapper.persistenceToAggregate(doc),
      ),
      meta: result.meta,
    };
  }

  /**
   * Deleted parcels are excluded unless the caller asks for them explicitly,
   * which only the admin listing does.
   */
  private buildFilter(filter?: ShipmentPaginationFilter): FilterQuery<ShipmentPersistence> {
    const query: FilterQuery<ShipmentPersistence> = {
      'deleted.deleted': filter?.deleted ?? false,
    };

    if (filter?.orderId) query.orderId = filter.orderId;
    if (filter?.vendorId) query.vendorId = filter.vendorId;
    if (filter?.buyerId) query.buyerId = filter.buyerId;
    if (filter?.status) query.status = filter.status;

    return query;
  }
}
