import { CartAggregate, type CartReadModel, CartItemVO } from '@ecomerece/domain';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { CartResponseReadModel } from '@ecomerece/shared';
import type { CartPersistence } from './cart.model';

export const CartMapper = {
  persistenceToAggregate(doc: CartPersistence): CartAggregate {
    return CartAggregate.rehydrate(
      Id.create(doc._id),
      Id.create(doc.buyerId),
      doc.items.map((item) =>
        CartItemVO.rehydrate(
          Id.create(item._id),
          Id.create(item.variantId),
          Quantity.rehydrate(item.quantity),
          EffectiveDate.rehydrate(item.addedAt),
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

  aggregateToPersistence(cart: CartAggregate) {
    return {
      _id: cart.id.value,
      buyerId: cart.buyerId.value,
      items: cart.items.map((item) => ({
        _id: item.id.value,
        variantId: item.variantId.value,
        quantity: item.quantity.value,
        addedAt: item.addedAt.value,
      })),
      version: cart.version.value,
      deleted: {
        deleted: cart.delete.deleted,
        deletedFrom: cart.delete.from?.value ?? null,
        deletedBy: cart.delete.performedBy?.value ?? null,
        reason: cart.delete.reason?.value ?? null,
      },
      createdAt: cart.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(cart: CartAggregate): CartReadModel {
    return {
      id: cart.id.value,
      buyerId: cart.buyerId.value,
      items: cart.items.map((item) => ({
        id: item.id.value,
        variantId: item.variantId.value,
        quantity: item.quantity.value,
        addedAt: item.addedAt.value,
      })),
      deleted: {
        deleted: cart.delete.deleted,
        deletedFrom: cart.delete.from?.value ?? null,
        deletedBy: cart.delete.performedBy?.value ?? null,
        reason: cart.delete.reason?.value ?? null,
      },
      createdAt: cart.createdAt.value,
    };
  },

  persistenceToReadModel(doc: CartPersistence): CartReadModel {
    return {
      id: doc._id,
      buyerId: doc.buyerId,
      items: doc.items.map((item) => ({
        id: item._id,
        variantId: item.variantId,
        quantity: item.quantity,
        addedAt: item.addedAt,
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

  aggregateToResponseReadModel(cart: CartAggregate): CartResponseReadModel {
    return {
      id: cart.id.value,
      buyerId: cart.buyerId.value,
      items: cart.items.map((item) => ({
        id: item.id.value,
        variantId: item.variantId.value,
        quantity: item.quantity.value,
      })),
      createdAt: cart.createdAt.value,
    };
  },
};
