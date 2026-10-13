import { InventoryAggregate } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type {
  buyMyInventoryStockDtoType,
  createMyInventoryDtoType,
  GetAdminPaginatedInventoryQueryDto,
  InventoryResponseReadModel,
  removeMyInventoryStockDtoType,
  updateMylowStockThresholdDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { idType } from '../../../../../packages/shared/dtos/id-schema';
import type { InMemoryQueryBus } from '../../../core/infrastructure/buses/in-memory-query-bus';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { EnsureActiveProductGetByIdQuery } from '../../product/application/queries/ensure-active-product-get-by-id.query';
import { EnsureActiveVariantGetByIdQuery } from '../../product-variant/application/queries/ensure-active-variant-get-by-id.query';
import { EnsureActiveUserGetByIdQuery } from '../../user/application/queries/ensure-active-user-get-by-id.query';
import type { UserPersistence } from '../../user/infrastructure/user.models';
import { EnsureActiveVendorGetByIdQuery } from '../../vendor/application/queries/ensure-active-vendor-get-by-id.query';
import { InventoryMapper } from '../infrastructure/inventory.mapper';
import type { InventoryPersistence } from '../infrastructure/inventory.model';
import type { InventoryReposityory } from '../infrastructure/inventory.repository';
import { InventoryMessages, type inventoryMessagesType } from '../presentation/inventory.messages';

export class InventoryApplicationService extends BaseService {
  constructor(
    private readonly inventoryRepo: InventoryReposityory,
    private readonly queryBus: InMemoryQueryBus,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  private async publishEvents(inventory: InventoryAggregate): Promise<void> {
    const events = inventory.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async canActorEditInventory(variantId: Id, actorId: Id): Promise<void> {
    const activeVariant = await this.queryBus.execute(
      new EnsureActiveVariantGetByIdQuery({ variantId: variantId }),
    );
    if (!activeVariant.variant) throw new BadRequestError('Variant not found.');
    if (!activeVariant.active) throw new BadRequestError('Variant is not active.');
    const productId = Id.create(activeVariant.variant.productId);
    const activeProduct = await this.queryBus.execute(
      new EnsureActiveProductGetByIdQuery({ productId: productId }),
    );
    if (!activeProduct.product) throw new BadRequestError('Product not found.');
    if (!activeProduct.active) throw new BadRequestError('Product is not active.');
    const vendorId = Id.create(activeProduct.product.vendorId);
    const activeVendor = await this.queryBus.execute(
      new EnsureActiveVendorGetByIdQuery({ vendorId: vendorId }),
    );
    if (!activeVendor.vendor) throw new BadRequestError('Vendor not found.');
    if (!activeVendor.active) throw new BadRequestError('Vendor is not active.');
    if (activeVendor.vendor.ownerId !== actorId.value)
      throw new BadRequestError('This variant does not belong to the current owner.');
    const userId = Id.create(activeVendor.vendor.ownerId);
    const activeUser = await this.queryBus.execute(
      new EnsureActiveUserGetByIdQuery({ userId: userId }),
    );
    if (!activeUser.user) throw new BadRequestError('User not found.');
    if (!activeUser.active) throw new BadRequestError('User is not active.');
  }

  async createMyInventory(
    data: createMyInventoryDtoType,
    actor: UserPersistence,
  ): Promise<inventoryMessagesType> {
    const inventoryId = Id.create();
    const actorId = Id.create(actor._id);
    const variantId = Id.create(data.variantId);
    const lowStockThreshold = Quantity.create(data.lowStockThreshold);
    const available = Quantity.create(data.available);
    await this.canActorEditInventory(variantId, actorId);
    const inventory = InventoryAggregate.create({
      id: inventoryId,
      variantId,
      lowStockThreshold,
      available,
    });
    await this.inventoryRepo.Create(inventory);
    await this.publishEvents(inventory);
    const inventoryReaponseReadModel = InventoryMapper.aggregateToResponseReadModel(inventory);
    return InventoryMessages.inventoryCreated(inventoryId, actorId, inventoryReaponseReadModel);
  }

  async buyMyInventoryStock(
    data: buyMyInventoryStockDtoType,
    id: idType,
    actor: UserPersistence,
  ): Promise<inventoryMessagesType> {
    const inventoryId = Id.create(id);
    const actorId = Id.create(actor._id);
    const quantity = Quantity.create(data.quantity);
    const inventory = await this.inventoryRepo.FindByIdOrThrow(inventoryId);
    await this.canActorEditInventory(inventory.variantId, actorId);
    inventory.buy(quantity, actorId);
    await this.inventoryRepo.Save(inventory);
    await this.publishEvents(inventory);
    const inventoryReaponseReadModel = InventoryMapper.aggregateToResponseReadModel(inventory);
    return InventoryMessages.inventoryBought(
      inventoryId,
      quantity,
      actorId,
      inventoryReaponseReadModel,
    );
  }
  async removeMyInventoryStock(
    data: removeMyInventoryStockDtoType,
    id: idType,
    actor: UserPersistence,
  ): Promise<inventoryMessagesType> {
    const inventoryId = Id.create(id);
    const actorId = Id.create(actor._id);
    const quantity = Quantity.create(data.quantity);
    const inventory = await this.inventoryRepo.FindByIdOrThrow(inventoryId);
    await this.canActorEditInventory(inventory.variantId, actorId);
    inventory.removeStock(quantity, actorId);
    await this.inventoryRepo.Save(inventory);
    await this.publishEvents(inventory);
    const inventoryReaponseReadModel = InventoryMapper.aggregateToResponseReadModel(inventory);
    return InventoryMessages.inventoryRemoved(
      inventoryId,
      quantity,
      actorId,
      inventoryReaponseReadModel,
    );
  }

  async updateMylowStockThreshold(
    data: updateMylowStockThresholdDtoType,
    id: idType,
    actor: UserPersistence,
  ): Promise<inventoryMessagesType> {
    const inventoryId = Id.create(id);
    const actorId = Id.create(actor._id);
    const lowStockThreshold = Quantity.create(data.lowStockThreshold);
    const inventory = await this.inventoryRepo.FindByIdOrThrow(inventoryId);
    await this.canActorEditInventory(inventory.variantId, actorId);
    inventory.updateLowStockThreshold(lowStockThreshold, actorId);
    await this.inventoryRepo.Save(inventory);
    await this.publishEvents(inventory);
    const inventoryReaponseReadModel = InventoryMapper.aggregateToResponseReadModel(inventory);
    return InventoryMessages.lowStockThresholdUpdated(
      inventoryId,
      lowStockThreshold,
      actorId,
      inventoryReaponseReadModel,
    );
  }

  async getInventoryByVarientId(id: string): Promise<InventoryResponseReadModel> {
    const variantId = Id.create(id);
    const varinat = await this.inventoryRepo.FindByVariantIdOrThrow(variantId);
    return InventoryMapper.aggregateToResponseReadModel(varinat);
  }

  // Admin: all inventory — no baseline restrictions, optional filters
  async findAdminPaginatedInventory(query: GetAdminPaginatedInventoryQueryDto) {
    const filter: FilterQuery<InventoryPersistence> = {};
    if (query.variantId) filter.variantId = Id.create(query.variantId).value;
    if (query.inStock !== undefined) filter.inStock = query.inStock;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.inventoryRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((inventory) => InventoryMapper.aggregateToReadModel(inventory)),
      meta: result.meta,
    };
  }
}
