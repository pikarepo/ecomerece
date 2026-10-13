import { OrderAggregate } from '@ecomerece/domain';
import type { InventoryReadModel } from '@ecomerece/domain/modules/inventory/read-models/inventory.read-model';
import type { ProductReadModel } from '@ecomerece/domain/modules/product/read-models/product.read-model';
import type { ProductVariantReadModel } from '@ecomerece/domain/modules/product-variant/read-models/product-variant.read-model';
import type { UserReadModel } from '@ecomerece/domain/modules/user/read-models/user.read-model';
import type { VendorReadModel } from '@ecomerece/domain/modules/vendor/read-models/vendor-read-model';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type {
  createMyOrderDtoType,
  GetAdminPaginatedOrdersQueryDto,
  GetMyOrdersQueryDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { InMemoryCommandBus } from '../../../core/infrastructure/buses/in-memory-command-bus';
import type { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import type { InMemoryQueryBus } from '../../../core/infrastructure/buses/in-memory-query-bus';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { EnsureActiveAddressGetByIdQuery } from '../../address/application/queries/ensure-active-address-get-by-it.query';
import { ReserveInventoryCommand } from '../../inventory/application/commands/reserve-inventory.command';
import { CreateItemsCommand } from '../../order-items/application/commands/create-items-inventory.command';
import { VerifyProductAndGetQuery } from '../../product/application/queries/verify-product-and-get.query';
import { VerifyVariantsAndGetQuery } from '../../product-variant/application/queries/verify-variants-and-get.query';
import { EnsureActiveUserGetByIdQuery } from '../../user/application/queries/ensure-active-user-get-by-id.query';
import { VerifyUserAndGetQuery } from '../../user/application/queries/verify-user-and-get.query';
import type { UserPersistence } from '../../user/infrastructure/user.models';
import { VerifyVendorAndGetQuery } from '../../vendor/application/queries/verify-vendor-and-get.query';
import { OrderMapper } from '../infrastructure/order.mapper';
import type { OrderPersistence } from '../infrastructure/order.model';
import type { OrderRepository } from '../infrastructure/order.repository';
import { OrderMessages } from '../presentation/order.messages';

interface InventoryResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
}
interface VerifyReportResult {
  fullAddress: FullAddressVO;
  report: Array<{
    variantId: Id;
    productId: Id | null;
    quantity: Quantity;
    price: number | null;
    valid: boolean;
    reason: string | null;
  }>;
  validOrderItems: Array<{
    variantId: Id;
    productId: Id;
    quantity: Quantity;
    price: number; // price is guaranteed here
  }>;
  firstReport: any;
}

export class OrderApplicationService extends BaseService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly queryBus: InMemoryQueryBus,
    private readonly eventBus: InMemoryEventBus,
    private readonly commandBus: InMemoryCommandBus,
  ) {
    super();
  }

  getReport(
    variants: {
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      nonActiveIds: Id[];
      variantReadModel: ProductVariantReadModel[];
    },
    products: {
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      blockedIds: Id[];
      productReadModel: ProductReadModel[];
    },
    vendors: {
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      nonVerifiedIds: Id[];
      vendorReadModel: VendorReadModel[];
    },
    owners: {
      validIds: Id[];
      notFoundIds: Id[];
      bannedIds: Id[];
      blockedIds: Id[];
      deletedIds: Id[];
      userReadModel: UserReadModel[];
    },
    inventories?: InventoryResult,
  ) {
    // ----- 1. Build direct error maps -----
    const ownerErrors = new Map<string, string>();
    owners.notFoundIds.forEach((id) => ownerErrors.set(id.value, 'NOT_FOUND'));
    owners.bannedIds.forEach((id) => ownerErrors.set(id.value, 'BANNED'));
    owners.blockedIds.forEach((id) => ownerErrors.set(id.value, 'BLOCKED'));
    owners.deletedIds.forEach((id) => ownerErrors.set(id.value, 'DELETED'));

    const vendorErrors = new Map<string, string>();
    vendors.notFoundIds.forEach((id) => vendorErrors.set(id.value, 'NOT_FOUND'));
    vendors.deletedIds.forEach((id) => vendorErrors.set(id.value, 'DELETED'));
    vendors.nonVerifiedIds.forEach((id) => vendorErrors.set(id.value, 'UNVERIFIED'));

    const productErrors = new Map<string, string>();
    products.notFoundIds.forEach((id) => productErrors.set(id.value, 'NOT_FOUND'));
    products.deletedIds.forEach((id) => productErrors.set(id.value, 'DELETED'));
    products.blockedIds.forEach((id) => productErrors.set(id.value, 'BLOCKED'));

    const variantErrors = new Map<string, string>();
    variants.notFoundIds.forEach((id) => variantErrors.set(id.value, 'NOT_FOUND'));
    variants.deletedIds.forEach((id) => variantErrors.set(id.value, 'DELETED'));
    variants.nonActiveIds.forEach((id) => variantErrors.set(id.value, 'INACTIVE'));

    // ----- 2. Build parent → child relationships -----
    const productToVariants = new Map<string, string[]>();
    for (const v of variants.variantReadModel) {
      const key = Id.create(v.productId).value;
      const list = productToVariants.get(key) || [];
      list.push(Id.create(v.id).value);
      productToVariants.set(key, list);
    }

    const vendorToProducts = new Map<string, string[]>();
    for (const p of products.productReadModel) {
      const key = Id.create(p.vendorId).value;
      const list = vendorToProducts.get(key) || [];
      list.push(Id.create(p.id).value);
      vendorToProducts.set(key, list);
    }

    const ownerToVendors = new Map<string, string[]>();
    for (const v of vendors.vendorReadModel) {
      const key = Id.create(v.ownerId).value;
      const list = ownerToVendors.get(key) || [];
      list.push(Id.create(v.id).value);
      ownerToVendors.set(key, list);
    }

    // ----- 3. Propagate errors TOP-DOWN -----
    for (const [ownerId, error] of ownerErrors) {
      const vendorsList = ownerToVendors.get(ownerId) || [];
      for (const vendorId of vendorsList) {
        if (!vendorErrors.has(vendorId)) {
          vendorErrors.set(vendorId, `OWNER_${error}`);
        }
      }
    }

    for (const [vendorId, error] of vendorErrors) {
      const productsList = vendorToProducts.get(vendorId) || [];
      for (const productId of productsList) {
        if (!productErrors.has(productId)) {
          productErrors.set(productId, `VENDOR_${error}`);
        }
      }
    }

    for (const [productId, error] of productErrors) {
      const variantsList = productToVariants.get(productId) || [];
      for (const variantId of variantsList) {
        if (!variantErrors.has(variantId)) {
          variantErrors.set(variantId, `PRODUCT_${error}`);
        }
      }
    }

    // ----- 4. Inventory errors -----
    if (inventories) {
      const inventoryErrors = new Map<string, string>();
      inventories.notFoundIds.forEach((id) => inventoryErrors.set(id.value, 'NOT_FOUND'));
      inventories.deletedIds.forEach((id) => {
        if (!inventoryErrors.has(id.value)) {
          inventoryErrors.set(id.value, 'DELETED');
        }
      });
      const availableSet = new Set(inventories.availableStockIds.map((id) => id.value));
      const buyableSet = new Set(inventories.buyableIds.map((id) => id.value));
      const variantHasInventory = new Set(
        inventories.inventoriesReadModel.map((inv) => Id.create(inv.variantId).value),
      );
      for (const variantId of variantHasInventory) {
        if (inventoryErrors.has(variantId)) continue;
        if (!availableSet.has(variantId)) {
          inventoryErrors.set(variantId, 'OUT_OF_STOCK');
        } else if (!buyableSet.has(variantId)) {
          inventoryErrors.set(variantId, 'NOT_BUYABLE');
        }
      }
      for (const [variantId, invError] of inventoryErrors) {
        if (!variantErrors.has(variantId)) {
          variantErrors.set(variantId, `INVENTORY_${invError}`);
        }
      }
    }

    // ----- 5. Build variant → product map -----
    const variantProductMap = new Map<string, string>();
    for (const v of variants.variantReadModel) {
      variantProductMap.set(Id.create(v.id).value, Id.create(v.productId).value);
    }

    // ----- 6. All variant IDs -----
    const allVariantIds = new Set<string>([
      ...variants.validIds.map((id) => id.value),
      ...variants.notFoundIds.map((id) => id.value),
      ...variants.deletedIds.map((id) => id.value),
      ...variants.nonActiveIds.map((id) => id.value),
    ]);

    // ----- 7. Generate report -----
    const report = [];
    for (const variantId of allVariantIds) {
      const error = variantErrors.get(variantId);
      const productIdValue = variantProductMap.get(variantId) || null;
      report.push({
        id: Id.create(variantId),
        productId: productIdValue ? Id.create(productIdValue) : null,
        valid: !error,
        reason: error || null,
      });
    }
    return report;
  }
  async verifyReport(
    userId: Id,
    addressId: Id,
    actorId: Id,
    items: { variantId: Id; quantity: Quantity }[],
  ) {
    // ----- 1. Validate address and user -----
    const address = await this.queryBus.execute(new EnsureActiveAddressGetByIdQuery({ addressId }));
    const user = await this.queryBus.execute(new EnsureActiveUserGetByIdQuery({ userId }));
    if (!address.active) throw new BadRequestError('Address is not active.');
    if (!address.address) throw new BadRequestError('Address not found.');
    if (!user.active) throw new BadRequestError('User is not active.');
    if (!user.user) throw new BadRequestError('User not found.');
    if (!address.address.fullAddress) throw new BadRequestError('Address details are incomplete.');

    // ----- 2. Fetch variants, products, vendors, owners -----
    const variantIds = items.map((item) => item.variantId);
    const variants = await this.queryBus.execute(
      new VerifyVariantsAndGetQuery({ ids: variantIds }),
    );
    const productIds = variants.variantReadModel.map((v) => v.productId);
    const products = await this.queryBus.execute(new VerifyProductAndGetQuery({ ids: productIds }));
    const vendorIds = products.productReadModel.map((p) => Id.create(p.vendorId));
    const vendors = await this.queryBus.execute(new VerifyVendorAndGetQuery({ ids: vendorIds }));
    const ownerIds = vendors.vendorReadModel.map((v) => Id.create(v.id));
    const owners = await this.queryBus.execute(new VerifyUserAndGetQuery({ ids: ownerIds }));

    // ----- 3. First report (without inventory) -----
    const emptyInventory: InventoryResult = {
      validIds: [],
      notFoundIds: [],
      deletedIds: [],
      availableStockIds: [],
      buyableIds: [],
      inventoriesReadModel: [],
    };
    const firstReport = this.getReport(variants, products, vendors, owners, emptyInventory);

    const validOrderItems = items.filter((item) =>
      firstReport.some((r) => r.valid && r.id.value === item.variantId.value),
    );

    const inventoryResult = await this.commandBus.execute<InventoryResult>(
      new ReserveInventoryCommand(validOrderItems, actorId),
    );

    const finalReport = this.getReport(variants, products, vendors, owners, inventoryResult);

    // Build price map
    const priceMap = new Map<string, number>();
    for (const v of variants.variantReadModel) {
      priceMap.set(Id.create(v.id).value, v.price);
    }

    // Build status map from finalReport
    const reportMap = new Map<
      string,
      { productId: string | null; valid: boolean; reason: string | null }
    >();
    for (const entry of finalReport) {
      reportMap.set(entry.id.value, {
        productId: entry.productId ? entry.productId.value : null,
        valid: entry.valid,
        reason: entry.reason,
      });
    }

    // Enrich report with price and null checks
    const enrichedReport = items.map((item) => {
      const variantId = item.variantId.value;
      const status = reportMap.get(variantId);
      const valid = status ? status.valid : false;
      let reason = status ? status.reason : 'UNKNOWN';
      const productId = status ? status.productId : null;
      const price = priceMap.get(variantId) ?? null;

      const finalValid = valid && price !== null;
      if (!finalValid && price === null) {
        reason = 'PRICE_MISSING';
      }

      return {
        variantId: item.variantId,
        productId: productId ? Id.create(productId) : null,
        quantity: item.quantity,
        price, // may be null
        valid: finalValid,
        reason,
      };
    });

    // Build variant → vendorId map
    const variantToVendor = new Map<string, string>();
    for (const v of variants.variantReadModel) {
      const variantId = Id.create(v.id).value;
      const productId = Id.create(v.productId).value;
      const product = products.productReadModel.find((p) => Id.create(p.id).value === productId);
      if (product) {
        const vendorId = Id.create(product.vendorId).value;
        variantToVendor.set(variantId, vendorId);
      }
    }

    const trulyValidOrderItems = enrichedReport
      .filter((entry) => entry.valid)
      .map((entry) => {
        const vendorIdValue = variantToVendor.get(entry.variantId.value);

        if (!vendorIdValue) {
          throw new Error(`Vendor not found for variant ${entry.variantId.value}`);
        }
        return {
          variantId: entry.variantId,
          productId: entry.productId as Id,
          quantity: entry.quantity,
          price: entry.price! as number,
          vendorId: Id.create(vendorIdValue), // now an Id object
        };
      });

    const fullAddress = FullAddressVO.create(address.address.fullAddress);

    return {
      fullAddress,
      report: enrichedReport,
      validOrderItems: trulyValidOrderItems,
      firstReport,
    };
  }

  async createMyOrder(data: createMyOrderDtoType, actor: UserPersistence) {
    const orderId = Id.create();
    const idempotentKey = Id.create(data.idempotentKey);
    const addressId = Id.create(data.addressId);
    const actorId = Id.create(actor._id);
    const waitingTime = ExpirationDate.create(data.waitingTime);
    const items = data.items.map((value) => ({
      variantId: Id.create(value.variantId),
      quantity: Quantity.create(value.quantity),
    }));
    await this.orderRepo.EnsureUniqueImpodentKey(idempotentKey);
    const result = await this.verifyReport(actorId, addressId, actorId, items);
    const totalPrice = result.validOrderItems.reduce(
      (sum, ele) => sum + ele.quantity.value * ele.price,
      0,
    );
    const order = OrderAggregate.create({
      id: orderId,
      idempotentKey: idempotentKey,
      totalPrice: Money.create(totalPrice),
      buyerId: actorId,
      address: result.fullAddress,
    });
    const orderItems = result.validOrderItems.map((element) => ({
      id: Id.create(),
      orderId: orderId,
      vendorId: element.vendorId,
      productId: element.productId,
      variantId: element.variantId,
      quantity: element.quantity,
      waitingTime: waitingTime,
      price: Money.create(element.price),
    }));
    await this.commandBus.execute(new CreateItemsCommand(orderItems));
    order.createOrder();
    await this.orderRepo.Create(order);
    const orderEvents = order.pullEvents();
    if (orderEvents.length > 0) {
      await this.eventBus.publish(orderEvents);
    }

    const response = OrderMapper.aggregateToResponseReadModel(order);
    return OrderMessages.orderCreated(orderId, actorId, addressId, response);
  }

  // Public: the authenticated user's own non-deleted orders
  async getMyOrders(query: GetMyOrdersQueryDto, buyerId: string) {
    const filter: FilterQuery<OrderPersistence> = {
      buyerId: Id.create(buyerId).value,
      'deleted.deleted': false,
    };
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.orderRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((order) => OrderMapper.aggregateToReadModel(order)),
      meta: result.meta,
    };
  }

  // Admin: all orders — no baseline restrictions, optional buyerId / deleted filters
  async findAdminPaginatedOrders(query: GetAdminPaginatedOrdersQueryDto) {
    const filter: FilterQuery<OrderPersistence> = {};
    if (query.buyerId) filter.buyerId = Id.create(query.buyerId).value;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.orderRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((order) => OrderMapper.aggregateToReadModel(order)),
      meta: result.meta,
    };
  }
}
