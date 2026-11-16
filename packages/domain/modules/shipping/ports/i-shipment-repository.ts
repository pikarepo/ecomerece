import type { Id, Quantity } from '../../../value-objects';
import type { ShipmentAggregate } from '../shipping.aggregate';

export interface ShipmentPaginationFilter {
  orderId?: string;
  vendorId?: string;
  buyerId?: string;
  status?: string;
  deleted?: boolean;
}

export interface ShipmentPage {
  data: ShipmentAggregate[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

export interface IShipmentRepository {
  FindById(id: Id): Promise<ShipmentAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ShipmentAggregate>;
  FindByTrackingNumber(trackingNumber: string): Promise<ShipmentAggregate | null>;
  FindByOrderId(orderId: Id): Promise<ShipmentAggregate[]>;
  FindPaginated(params: {
    filter?: ShipmentPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<ShipmentPage>;
  Create(shipment: ShipmentAggregate): Promise<void>;
  Save(shipment: ShipmentAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
