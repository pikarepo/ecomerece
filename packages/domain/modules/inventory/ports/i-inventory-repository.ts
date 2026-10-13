import type { Id } from '../../../value-objects';
import type { InventoryAggregate } from '../inventory.aggregate';

export interface IIventoryRepository {
  FindById(id: Id): Promise<InventoryAggregate | null>;
  FindByVariantIds(ids: Id[]): Promise<InventoryAggregate[]>;
  SaveMany(inventories: InventoryAggregate[]): Promise<void>;
  FindByVariantId(id: Id): Promise<InventoryAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<InventoryAggregate>;
  FindByVariantIdOrThrow(id: Id): Promise<InventoryAggregate>;
  Save(user: InventoryAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(user: InventoryAggregate): Promise<void>;
}
