import { ProductVariantAggregate } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';

import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import type {
  createMyProductVariantDtoType,
  GetAdminPaginatedVariantsQueryDto,
  ProductVariantResponseReadModel,
  softDeleteMyVariantDtoType,
  toggleVariantApperaaracneDtoType,
  upadteMyVariantMetaDtoType,
  updateMyVariatPriceDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { idType } from '../../../../../packages/shared/dtos/id-schema';
import type { InMemoryCommandBus } from '../../../core/infrastructure/buses/in-memory-command-bus';
import type { InMemoryQueryBus } from '../../../core/infrastructure/buses/in-memory-query-bus';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { UpdatePriceCommand } from '../../product/application/commands/update-price.command';
import { EnsureActiveProductGetByIdQuery } from '../../product/application/queries/ensure-active-product-get-by-id.query';
import { EnsureActiveUserGetByIdQuery } from '../../user/application/queries/ensure-active-user-get-by-id.query';
import type { UserPersistence } from '../../user/infrastructure/user.models';
import { EnsureActiveVendorGetByIdQuery } from '../../vendor/application/queries/ensure-active-vendor-get-by-id.query';
import { productVariantMapper } from '../infrastructure/product-variant.mapper';
import type { ProductVariantPersistence } from '../infrastructure/product-variant.model';
import type { ProductVariantRepository } from '../infrastructure/product-variant.repository';
import {
  type ProductVaraintMessagesType,
  productVaraintMessages,
} from '../presentation/product-variant.messages';

export class productVariantApplicationService extends BaseService {
  constructor(
    private readonly vairiantRepo: ProductVariantRepository,
    private readonly queryBus: InMemoryQueryBus,
    private readonly commandBus: InMemoryCommandBus,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  private async publishEvents(variant: ProductVariantAggregate): Promise<void> {
    const events = variant.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async canActorEditProductVaraintOrThrow(productId: Id, actorId: Id): Promise<void> {
    const activeUser = await this.queryBus.execute(
      new EnsureActiveUserGetByIdQuery({ userId: actorId }),
    );
    if (!activeUser.user) throw new BadRequestError('User not found.');
    if (!activeUser.active) throw new BadRequestError('User is not active.');
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
  }

  async createMyProductVariant(
    data: createMyProductVariantDtoType,
    actor: UserPersistence,
  ): Promise<ProductVaraintMessagesType> {
    const varaintId = Id.create();
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const discountedPrice = Money.create(data.discountedPrice);

    const price = Money.create(data.price);
    const title = Title.create(data.title);
    await this.canActorEditProductVaraintOrThrow(productId, actorId);
    const varaint = ProductVariantAggregate.create({
      id: varaintId,
      productId: productId,
      discountedPrice: discountedPrice,
      price: price,
      title: title,
      active: data.active,
    });
    await this.vairiantRepo.Create(varaint);
    await this.publishEvents(varaint);
    await this.syncPricingSummary(productId.value, actor);
    return productVaraintMessages.varaintCreated(varaintId, productId, actorId);
  }

  async getVarientsByProductId(id: idType): Promise<ProductVariantResponseReadModel[] | null> {
    const productId = Id.create(id);
    const activeProduct = await this.queryBus.execute(
      new EnsureActiveProductGetByIdQuery({ productId: productId }),
    );
    if (!activeProduct.product) throw new BadRequestError('Product not found.');
    if (!activeProduct.active) throw new BadRequestError('Product is not active.');
    const varaints = await this.vairiantRepo.FindByProductId(productId);
    if (!varaints) return null;
    const response = varaints.map((value) =>
      productVariantMapper.aggregateToResponseReadModel(value),
    );
    return response;
  }

  async updateMyVariantPrice(
    data: updateMyVariatPriceDtoType,
    actor: UserPersistence,
  ): Promise<ProductVaraintMessagesType> {
    const actorId = Id.create(actor._id);
    const price = Money.create(data.price);
    const discountedPrice = Money.create(data.discountedPrice);
    const productId = Id.create(data.productId);
    const variantId = Id.create(data.variantId);
    const variant = await this.vairiantRepo.EnsureOwnerShipGetByIdOrThrow(productId, variantId);
    await this.canActorEditProductVaraintOrThrow(productId, actorId);
    variant.updatePrice(price, discountedPrice, actorId);
    await this.vairiantRepo.Save(variant);
    await this.publishEvents(variant);
    await this.syncPricingSummary(variant.productId.value, actor);
    return productVaraintMessages.priceUpdated(price, discountedPrice, actorId, variantId);
  }

  async updateMyVariantMeta(
    data: upadteMyVariantMetaDtoType,
    actor: UserPersistence,
  ): Promise<ProductVaraintMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const variantId = Id.create(data.variantId);
    const title = Title.create(data.title);
    const variant = await this.vairiantRepo.EnsureOwnerShipGetByIdOrThrow(productId, variantId);
    await this.canActorEditProductVaraintOrThrow(productId, actorId);
    variant.updateMeta(title, actorId);
    await this.vairiantRepo.Save(variant);
    await this.publishEvents(variant);
    return productVaraintMessages.metaUpdated(variantId, actorId);
  }

  async toggleMyVaraintAppereance(
    data: toggleVariantApperaaracneDtoType,
    actor: UserPersistence,
  ): Promise<ProductVaraintMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const variantId = Id.create(data.variantId);
    const variant = await this.vairiantRepo.EnsureOwnerShipGetByIdOrThrow(productId, variantId);
    await this.canActorEditProductVaraintOrThrow(productId, actorId);
    if (data.appearance) {
      variant.activate(actorId);
      await this.vairiantRepo.Save(variant);
      await this.publishEvents(variant);
      await this.syncPricingSummary(variant.productId.value, actor);
      return productVaraintMessages.variantActivated(variantId, actorId);
    } else {
      variant.deActivate(actorId);
      await this.vairiantRepo.Save(variant);
      await this.publishEvents(variant);
      await this.syncPricingSummary(variant.productId.value, actor);
      return productVaraintMessages.variantDisabled(variantId, actorId);
    }
  }

  async softDeleteMyVariant(
    data: softDeleteMyVariantDtoType,
    actor: UserPersistence,
  ): Promise<ProductVaraintMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const variantId = Id.create(data.variantId);
    const reason = Reason.create(data.reason);
    const variant = await this.vairiantRepo.EnsureOwnerShipGetByIdOrThrow(productId, variantId);
    await this.canActorEditProductVaraintOrThrow(productId, actorId);
    variant.deleteProduct(actorId, reason);
    await this.vairiantRepo.Save(variant);
    await this.publishEvents(variant);
    await this.syncPricingSummary(variant.productId.value, actor);
    return productVaraintMessages.variantDeleted(variantId, actorId);
  }

  async recoverVariant(id: idType, actor: UserPersistence): Promise<ProductVaraintMessagesType> {
    const actorId = Id.create(actor._id);
    const variantId = Id.create(id);
    const variant = await this.vairiantRepo.FindByIdOrThrow(variantId);
    variant.recoverProduct(actorId);
    await this.vairiantRepo.Save(variant);
    await this.publishEvents(variant);
    await this.syncPricingSummary(variant.productId.value, actor);
    return productVaraintMessages.variantRecovered(variantId, actorId);
  }

  async syncPricingSummary(id: string, actor: UserPersistence) {
    const productId = Id.create(id);
    const actorId = Id.create(actor._id);
    let price;
    const activeVariants = await this.vairiantRepo.FindActiveByProductId(productId);

    if (!activeVariants || activeVariants.length === 0) {
      price = {
        minPrice: Money.zero(),
        maxPrice: Money.zero(),
        minDiscountedPrice: Money.zero(),
        maxDiscountedPrice: Money.zero(),
      };
    } else {
      const prices = activeVariants.map((v) => v.price.value);
      const discountedPrices = activeVariants.map((v) => v.discountedPrice.value);
      price = {
        minPrice: Money.create(Math.min(...prices)),
        maxPrice: Money.create(Math.max(...prices)),
        minDiscountedPrice: Money.create(Math.min(...discountedPrices)),
        maxDiscountedPrice: Money.create(Math.max(...discountedPrices)),
      };
    }

    await this.commandBus.execute(new UpdatePriceCommand(productId, price, actorId));
  }

  // Admin: all product variants — no baseline restrictions, optional filters
  async findAdminPaginatedVariants(query: GetAdminPaginatedVariantsQueryDto) {
    const filter: FilterQuery<ProductVariantPersistence> = {};
    if (query.productId) filter.productId = Id.create(query.productId).value;
    if (query.active !== undefined) filter.active = query.active;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' } as any;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.vairiantRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((variant) => productVariantMapper.aggregateToReadModel(variant)),
      meta: result.meta,
    };
  }
}
