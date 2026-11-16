import {
  ShipmentAggregate,
  type ShipmentListItemReadModel,
  type ShipmentReadModel,
  ShipmentStatusVO,
} from '@ecomerece/domain';
import { CarrierVO } from '@ecomerece/domain/modules/shipping/value-objects/carrier.vo';
import { ShippingMethodVO } from '@ecomerece/domain/modules/shipping/value-objects/shipping-method.vo';
import { TrackingEventVO } from '@ecomerece/domain/modules/shipping/value-objects/tracking-event.vo';
import { TrackingNumberVO } from '@ecomerece/domain/modules/shipping/value-objects/tracking-number.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type {
  PublicShipmentTrackingReadModel,
  ShipmentListItemResponseReadModel,
  ShipmentResponseReadModel,
} from '@ecomerece/shared';
import type { ShipmentPersistence } from './shipment.model';

const INVALID_FALLBACK_STATUS = 'pending' as const;

function toDate(value: Date | null): Date | null {
  return value ? new Date(value) : null;
}

export const ShipmentMapper = {
  persistenceToAggregate(doc: ShipmentPersistence): ShipmentAggregate {
    return ShipmentAggregate.rehydrate(
      Id.create(doc._id),
      Id.create(doc.orderId),
      Id.create(doc.vendorId),
      Id.create(doc.buyerId),
      CarrierVO.rehydrate(doc.carrier),
      ShippingMethodVO.rehydrate(doc.shippingMethod),
      doc.trackingNumber ? TrackingNumberVO.rehydrate(doc.trackingNumber) : null,
      ShipmentStatusVO.fromString(doc.status),
      Money.rehydrate(doc.cost),
      Quantity.rehydrate(doc.weightGrams),
      FullAddressVO.create(doc.address),
      toDate(doc.estimatedDelivery),
      doc.dispatchedAt ? EffectiveDate.rehydrate(doc.dispatchedAt) : null,
      doc.deliveredAt ? EffectiveDate.rehydrate(doc.deliveredAt) : null,
      doc.events.map((event) =>
        TrackingEventVO.rehydrate(
          ShipmentStatusVO.fromString(event.status),
          event.note,
          EffectiveDate.rehydrate(event.occurredAt),
        ),
      ),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.create(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },

  aggregateToPersistence(shipment: ShipmentAggregate) {
    return {
      _id: shipment.id.value,
      orderId: shipment.orderId.value,
      vendorId: shipment.vendorId.value,
      buyerId: shipment.buyerId.value,
      carrier: shipment.carrier.value,
      shippingMethod: shipment.shippingMethod.value,
      trackingNumber: shipment.trackingNumber?.value ?? null,
      status: shipment.status.value,
      cost: shipment.cost.value,
      weightGrams: shipment.weightGrams.value,
      address: shipment.address.value,
      estimatedDelivery: shipment.estimatedDelivery,
      dispatchedAt: shipment.dispatchedAt?.value ?? null,
      deliveredAt: shipment.deliveredAt?.value ?? null,
      events: shipment.trackingEvents.map((event) => ({
        status: event.status.value,
        note: event.note,
        occurredAt: event.occurredAt.value,
      })),
      version: shipment.version.value,
      deleted: {
        deleted: shipment.delete.deleted,
        deletedFrom: shipment.delete.from?.value ?? null,
        deletedBy: shipment.delete.performedBy?.value ?? null,
        reason: shipment.delete.reason?.value ?? null,
      },
      createdAt: shipment.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(shipment: ShipmentAggregate): ShipmentReadModel {
    return {
      id: shipment.id.value,
      orderId: shipment.orderId.value,
      vendorId: shipment.vendorId.value,
      buyerId: shipment.buyerId.value,
      carrier: shipment.carrier.value,
      shippingMethod: shipment.shippingMethod.value,
      trackingNumber: shipment.trackingNumber?.value ?? null,
      status: shipment.status.value,
      cost: shipment.cost.value,
      weightGrams: shipment.weightGrams.value,
      address: shipment.address.value,
      estimatedDelivery: shipment.estimatedDelivery,
      dispatchedAt: shipment.dispatchedAt?.value ?? null,
      deliveredAt: shipment.deliveredAt?.value ?? null,
      events: shipment.trackingEvents.map((event) => ({
        status: event.status.value,
        note: event.note,
        occurredAt: event.occurredAt.value,
      })),
      deleted: {
        deleted: shipment.delete.deleted,
        deletedFrom: shipment.delete.from?.value ?? null,
        deletedBy: shipment.delete.performedBy?.value ?? null,
        reason: shipment.delete.reason?.value ?? null,
      },
      createdAt: shipment.createdAt.value,
    };
  },

  persistenceToReadModel(doc: ShipmentPersistence): ShipmentReadModel {
    return {
      id: doc._id,
      orderId: doc.orderId,
      vendorId: doc.vendorId,
      buyerId: doc.buyerId,
      carrier: doc.carrier,
      shippingMethod: doc.shippingMethod,
      trackingNumber: doc.trackingNumber ?? null,
      status: doc.status || INVALID_FALLBACK_STATUS,
      cost: doc.cost,
      weightGrams: doc.weightGrams,
      address: doc.address,
      estimatedDelivery: toDate(doc.estimatedDelivery),
      dispatchedAt: toDate(doc.dispatchedAt),
      deliveredAt: toDate(doc.deliveredAt),
      events: doc.events.map((event) => ({
        status: event.status,
        note: event.note ?? null,
        occurredAt: event.occurredAt,
      })),
      deleted: {
        deleted: doc.deleted.deleted,
        deletedFrom: doc.deleted.deletedFrom ?? null,
        deletedBy: doc.deleted.deletedBy ?? null,
        reason: doc.deleted.reason ?? null,
      },
      createdAt: doc.createdAt,
    };
  },

  aggregateToResponseReadModel(shipment: ShipmentAggregate): ShipmentResponseReadModel {
    return {
      id: shipment.id.value,
      orderId: shipment.orderId.value,
      vendorId: shipment.vendorId.value,
      carrier: shipment.carrier.value,
      shippingMethod: shipment.shippingMethod.value,
      trackingNumber: shipment.trackingNumber?.value ?? null,
      status: shipment.status.value,
      cost: shipment.cost.value,
      weightGrams: shipment.weightGrams.value,
      address: shipment.address.value,
      estimatedDelivery: shipment.estimatedDelivery,
      dispatchedAt: shipment.dispatchedAt?.value ?? null,
      deliveredAt: shipment.deliveredAt?.value ?? null,
      events: shipment.trackingEvents.map((event) => ({
        status: event.status.value,
        note: event.note,
        occurredAt: event.occurredAt.value,
      })),
      createdAt: shipment.createdAt.value,
    };
  },

  aggregateToListItemReadModel(shipment: ShipmentAggregate): ShipmentListItemResponseReadModel {
    return {
      id: shipment.id.value,
      orderId: shipment.orderId.value,
      carrier: shipment.carrier.value,
      shippingMethod: shipment.shippingMethod.value,
      trackingNumber: shipment.trackingNumber?.value ?? null,
      status: shipment.status.value,
      cost: shipment.cost.value,
      estimatedDelivery: shipment.estimatedDelivery,
      createdAt: shipment.createdAt.value,
    };
  },

  aggregateToPublicTrackingReadModel(shipment: ShipmentAggregate): PublicShipmentTrackingReadModel {
    return {
      trackingNumber: shipment.trackingNumber?.value ?? '',
      carrier: shipment.carrier.value,
      shippingMethod: shipment.shippingMethod.value,
      status: shipment.status.value,
      estimatedDelivery: shipment.estimatedDelivery,
      deliveredAt: shipment.deliveredAt?.value ?? null,
      events: shipment.trackingEvents.map((event) => ({
        status: event.status.value,
        note: event.note,
        occurredAt: event.occurredAt.value,
      })),
    };
  },
};
