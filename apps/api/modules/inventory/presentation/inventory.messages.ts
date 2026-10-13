import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { InventoryResponseReadModel } from '@ecomerece/shared';

export type inventoryMessagesType = {
  updatedData?: InventoryResponseReadModel;
  message: string;
};
export const InventoryMessages = {
  inventoryCreated(
    inventoryId: Id,
    actorId: Id,
    inventory: InventoryResponseReadModel,
  ): inventoryMessagesType {
    return {
      updatedData: inventory,
      message: `Inventory ${inventoryId.value} was created by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  inventoryBought(
    inventoryId: Id,
    items: Quantity,
    actorId: Id,
    inventory: InventoryResponseReadModel,
  ): inventoryMessagesType {
    return {
      updatedData: inventory,
      message: `Inventory ${inventoryId.value} was restocked by ${actorId.value} with ${items.value} units on ${EffectiveDate.today().value}.`,
    };
  },
  inventoryRemoved(
    inventoryId: Id,
    items: Quantity,
    actorId: Id,
    inventory: InventoryResponseReadModel,
  ): inventoryMessagesType {
    return {
      updatedData: inventory,
      message: `${items.value} units were removed from inventory ${inventoryId.value} by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  lowStockThresholdUpdated(
    inventoryId: Id,
    items: Quantity,
    actorId: Id,
    inventory: InventoryResponseReadModel,
  ): inventoryMessagesType {
    return {
      updatedData: inventory,
      message: `The low-stock threshold for inventory ${inventoryId.value} was set to ${items.value} units by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
