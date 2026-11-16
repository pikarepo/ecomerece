import type { ShipmentAggregate } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { PublicShipmentTrackingReadModel, ShipmentResponseReadModel } from '@ecomerece/shared';
import { ShipmentMapper } from '../infrastructure/shipment.mapper';

export type ShippingMessagesType = {
  message: string;
  updatedData: ShipmentResponseReadModel | PublicShipmentTrackingReadModel;
};

export const ShippingMessages = {
  shipmentCreated(shipment: ShipmentAggregate): ShippingMessagesType {
    return {
      updatedData: ShipmentMapper.aggregateToResponseReadModel(shipment),
      message: `Shipment ${shipment.id.value} was created for order ${shipment.orderId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  shipmentUpdated(shipment: ShipmentAggregate, action: string): ShippingMessagesType {
    return {
      updatedData: ShipmentMapper.aggregateToResponseReadModel(shipment),
      message: `Shipment ${shipment.id.value} is now ${action} (status: ${shipment.status.value}) on ${EffectiveDate.today().value}.`,
    };
  },
  shipmentDeleted(shipment: ShipmentAggregate, reason: Reason): ShippingMessagesType {
    return {
      updatedData: ShipmentMapper.aggregateToResponseReadModel(shipment),
      message: `Shipment ${shipment.id.value} was deleted on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  shipmentRecovered(shipment: ShipmentAggregate): ShippingMessagesType {
    return {
      updatedData: ShipmentMapper.aggregateToResponseReadModel(shipment),
      message: `Shipment ${shipment.id.value} was recovered on ${EffectiveDate.today().value}.`,
    };
  },
};
