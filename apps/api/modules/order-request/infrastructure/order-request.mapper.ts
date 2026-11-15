import { OrderRequestAggregate } from '@ecomerece/domain/modules/order-request/order-request.aggregate';
import type { OrderRequestReadModel } from '@ecomerece/domain/modules/order-request/read-models/order-request.read-model';
import { OrderRequestImageVO } from '@ecomerece/domain/modules/order-request/value-objects/order-request-image.vo';
import { OrderRequestStatusVO } from '@ecomerece/domain/modules/order-request/value-objects/order-request-status.vo';
import { OrderRequestTypeVO } from '@ecomerece/domain/modules/order-request/value-objects/order-request-type.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
import type { OrderRequestPersistence } from './order-request.model';

export const OrderRequestMapper = {
  persistenceToAggregate(doc: OrderRequestPersistence): OrderRequestAggregate {
    return OrderRequestAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.orderId),
      doc.orderItemId ? Id.rehydrate(doc.orderItemId) : null,
      Id.rehydrate(doc.vendorId),
      Id.rehydrate(doc.buyerId),
      OrderRequestTypeVO.rehydrate(doc.type),
      OrderRequestStatusVO.rehydrate(doc.status),
      Reason.rehydrate(doc.reason),
      doc.note,
      doc.images.map((image) =>
        OrderRequestImageVO.rehydrate(UrlVO.rehydrate(image.url), image.key),
      ),
      doc.vendorResponseNote,
      EffectiveDate.rehydrate(doc.createdAt),
      EffectiveDate.rehydrate(doc.updatedAt),
    );
  },

  aggregateToPersistence(request: OrderRequestAggregate): OrderRequestPersistence {
    return {
      _id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId?.value ?? null,
      vendorId: request.vendorId.value,
      buyerId: request.buyerId.value,
      type: request.type.value,
      status: request.status.value,
      reason: request.reason.value,
      note: request.note,
      images: request.images.map((image) => ({ url: image.url.value, key: image.key })),
      vendorResponseNote: request.vendorResponseNote,
      createdAt: request.createdAt.value,
      updatedAt: request.updatedAt.value,
    };
  },

  aggregateToReadModel(request: OrderRequestAggregate): OrderRequestReadModel {
    return {
      id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId?.value ?? null,
      vendorId: request.vendorId.value,
      buyerId: request.buyerId.value,
      type: request.type.value,
      status: request.status.value,
      reason: request.reason.value,
      note: request.note,
      images: request.images.map((image) => ({ url: image.url.value, key: image.key })),
      vendorResponseNote: request.vendorResponseNote,
      createdAt: request.createdAt.value,
      updatedAt: request.updatedAt.value,
    };
  },

  persistenceToReadModel(doc: OrderRequestPersistence): OrderRequestReadModel {
    return OrderRequestMapper.aggregateToReadModel(OrderRequestMapper.persistenceToAggregate(doc));
  },
};
