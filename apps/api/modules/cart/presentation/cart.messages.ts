import type { CartOrderResult } from '@ecomerece/contracts';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  CartCheckedOutReadModel,
  CartResponseReadModel,
  CartCheckoutResponseReadModel,
} from '@ecomerece/shared';
import { CartMapper } from '../infrastructure/cart.mapper';
import type { CartAggregate } from '@ecomerece/domain';

export type CartMessagesType = {
  message: string;
  updatedData: CartResponseReadModel | CartCheckedOutReadModel;
};

export const CartMessages = {
  cartInitialized(cart: CartAggregate, buyerId: Id): CartMessagesType {
    return {
      updatedData: CartMapper.aggregateToResponseReadModel(cart),
      message: `Cart ${cart.id.value} was initialized for buyer ${buyerId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  cartDeleted(cart: CartAggregate, actorId: Id, reason: Reason): CartMessagesType {
    return {
      updatedData: CartMapper.aggregateToResponseReadModel(cart),
      message: `Cart ${cart.id.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  itemAdded(cart: CartAggregate, buyerId: Id, cartItemId: Id): CartMessagesType {
    return {
      updatedData: CartMapper.aggregateToResponseReadModel(cart),
      message: `Cart item ${cartItemId.value} was added to cart ${cart.id.value} of buyer ${buyerId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  checkedOut(cart: CartAggregate, buyerId: Id, order: CartOrderResult): CartMessagesType {
    const checkedOut: CartCheckedOutReadModel = {
      cart: CartMapper.aggregateToResponseReadModel(cart),
      order: CartMessages.orderSummary(order),
    };

    return {
      updatedData: checkedOut,
      message: `Cart ${cart.id.value} of buyer ${buyerId.value} was checked out as order ${order.orderId.value} (${order.orderType}) for ${order.vendorIds.length} vendor(s) on ${EffectiveDate.today().value}.`,
    };
  },
  orderSummary(order: CartOrderResult): CartCheckoutResponseReadModel {
    return {
      orderId: order.orderId.value,
      orderType: order.orderType,
      vendorIds: order.vendorIds,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    };
  },
};
