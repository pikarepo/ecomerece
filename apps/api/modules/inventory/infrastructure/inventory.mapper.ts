import { DeleteInfoVO, InventoryAggregate, type InventoryReadModel } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { InventoryResponseReadModel } from '@ecomerece/shared';
import type { InventoryPersistence } from './inventory.model';

export const InventoryMapper = {
  persistenceToAggregate(doc: InventoryPersistence): InventoryAggregate {
    return InventoryAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.variantId),
      Quantity.rehydrate(doc.available),
      Quantity.rehydrate(doc.reserved),
      Quantity.rehydrate(doc.lowStockThreshold),
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
  aggregateToPersistence(inventory: InventoryAggregate) {
    return {
      _id: inventory.id.value,
      variantId: inventory.variantId.value,
      available: inventory.available.value,
      reserved: inventory.reserved.value,
      lowStockThreshold: inventory.lowStockThreshold.value,
      deleted: {
        deleted: inventory.delete.deleted,
        deletedFrom: inventory.delete.from?.value ?? null,
        deletedBy: inventory.delete.performedBy?.value ?? null,
        reason: inventory.delete.reason?.value ?? null,
      },
      createdAt: inventory.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },
  aggregateToReadModel(inventory: InventoryAggregate): InventoryReadModel {
    return {
      id: inventory.id.value,
      variantId: inventory.variantId.value,
      available: inventory.available.value,
      reserved: inventory.reserved.value,
      lowStockThreshold: inventory.lowStockThreshold.value,
      deleted: {
        deleted: inventory.delete.deleted,
        deletedFrom: inventory.delete.from?.value ?? null,
        deletedBy: inventory.delete.performedBy?.value ?? null,
        reason: inventory.delete.reason?.value ?? null,
      },
      createdAt: inventory.createdAt.value,
    };
  },

  persistenceToReadModel(inventory: InventoryPersistence): InventoryReadModel {
    return {
      id: inventory._id,
      variantId: inventory.variantId,
      available: inventory.available,
      reserved: inventory.reserved,
      lowStockThreshold: inventory.lowStockThreshold,
      deleted: {
        deleted: inventory.deleted.deleted,
        deletedFrom: inventory.deleted.deletedFrom ?? null,
        deletedBy: inventory.deleted.deletedBy ?? null,
        reason: inventory.deleted.reason ?? null,
      },
      createdAt: inventory.createdAt,
    };
  },
  aggregateToResponseReadModel(inventory: InventoryAggregate): InventoryResponseReadModel {
    return {
      id: inventory.id.value,
      variantId: inventory.variantId.value,
      available: inventory.available.value,
      reserved: inventory.reserved.value,
      lowStockThreshold: inventory.lowStockThreshold.value,
      createdAt: inventory.createdAt.value,
    };
  },
};
