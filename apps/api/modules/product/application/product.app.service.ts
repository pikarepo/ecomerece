import {
  DisclaimerVO,
  type IImageStoragePort,
  ImageKey,
  ImageSource,
  ImagesVO,
  IngredientsVO,
  ProductAggregate,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { IQueryBus } from '@ecomerece/domain/query/query-bus.interface';
import { AltVO } from '@ecomerece/domain/value-objects/alt.vo';
import { Description } from '@ecomerece/domain/value-objects/description.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ImageVO } from '@ecomerece/domain/value-objects/image.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
import type {
  blockLiftProductDtoType,
  blockProductDtoType,
  CreateMyProductDto,
  deafultImageDtoType,
  disclaimerItemsDtoType,
  GetAdminPaginatedProductsQueryDto,
  GetMyPaginatedProductsQueryDto,
  GetPaginatedProductsQueryDto,
  imagesDtoType,
  ingredientsDtotype,
  ProductResponseReadModel,
  productAppereanceDtoType,
  recoverProductDtoType,
  softDeleteMyProductDtoType,
  toggleDiscalimerDtoType,
  toggleIngredientsDtoType,
  updateProductMetaDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { VerifyCategoryAndGetQuery } from '@ecomerece/contracts';
import type { AuthActor } from '@ecomerece/contracts';
import { GetVendorByUserIdQuery } from '@ecomerece/contracts';
import { ProductMapper } from '../infrastructure/product.mapper';
import type { ProductPersistence } from '../infrastructure/product.model';
import type { ProductRepository } from '../infrastructure/product.repository';
import { productMessages, type productMessagesType } from '../presentation/product.messages';

export class ProductApplicationService extends BaseService {
  constructor(
    private readonly queryBus: IQueryBus,
    private readonly productRepo: ProductRepository,
    private readonly eventBus: IEventBus,
    private readonly imageStorage: IImageStoragePort,
  ) {
    super();
  }

  private isDataUri(value: string): boolean {
    return value.startsWith('data:image/');
  }

  private decodeDataUri(value: string): { contentType: string; bytes: Uint8Array } {
    const separator = value.indexOf(',');
    const header = value.slice(5, separator);
    return {
      contentType: header.split(';')[0],
      bytes: Buffer.from(value.slice(separator + 1), 'base64'),
    };
  }

  private async resolveImage(
    value: string,
    folder: string,
  ): Promise<{ url: UrlVO; imageKey?: string }> {
    if (!this.isDataUri(value)) {
      return { url: UrlVO.create(value) };
    }
    const { contentType, bytes } = this.decodeDataUri(value);
    const stored = await this.imageStorage.upload(ImageSource.fromBytes(bytes, contentType), {
      folder,
      access: 'public',
    });
    return { url: UrlVO.create(stored.publicUrl), imageKey: stored.key.value };
  }

  /** Best-effort cleanup — a failed delete must never fail the request. */
  private async deleteImage(key?: string): Promise<void> {
    if (!key) return;
    try {
      await this.imageStorage.delete(ImageKey.rehydrate(key));
    } catch (error) {
      console.error(
        `[product] failed to clean up stored image '${key}':`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  private async publishEvents(product: ProductAggregate): Promise<void> {
    const events = product.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async getProductById(id: string): Promise<ProductResponseReadModel> {
    const productId = Id.create(id);
    const product = await this.productRepo.FindByIdOrThrow(productId);
    return ProductMapper.aggregateToResponseReadModel(product);
  }

  async createMyProduct(
    data: CreateMyProductDto,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const id = Id.create();
    const actorId = Id.create(actor._id);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const resolvedImages = await Promise.all(
      data.image.images.map((val) => this.resolveImage(val.url, 'products')),
    );
    const images = ImagesVO.create(
      data.image.images.map((val, index) =>
        ImageVO.create(
          resolvedImages[index].url,
          AltVO.create(val.alt),
          val.default,
          resolvedImages[index].imageKey,
        ),
      ),
    );
    const categoryId = Id.create(data.categoryId);
    const title = Title.create(data.title);
    const description = Description.create(data.description);
    const ingredients = IngredientsVO.create({
      isIngredients: data.ingredient.isIngredients,
      items: data.ingredient.ingredients.map((val) => Title.create(val)),
    });
    const verfied = await this.queryBus.execute(new VerifyCategoryAndGetQuery({ id: categoryId }));
    if (!verfied.isValid) throw new BadRequestError('The provided category is invalid.');
    const disclaimer = DisclaimerVO.create({
      isDisclaimer: data.disclaimer.isDisclaimer,
      items: data.disclaimer.disclaimers.map((val) => ({
        name: Title.create(val.name),
        title: Title.create(val.title),
      })),
    });
    const vendorTitle = Title.create(vendor.title);
    const product = ProductAggregate.create({
      id: id,
      categoryId: categoryId,
      vendorId: vendorId,
      vendorTitle: vendorTitle,
      images: images,
      title: title,
      description: description,
      ingredients: ingredients,
      disclaimer: disclaimer,
    });
    await this.productRepo.Create(product);
    await this.publishEvents(product);
    return productMessages.productCreated(id, vendorId);
  }

  async softDeleteMyProduct(
    data: softDeleteMyProductDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    const reason = Reason.create(data.reason);
    product.deleteProduct(actorId, reason);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productDeleted(productId, actorId, reason);
  }

  async recoverMyProduct(
    data: recoverProductDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.recoverProduct();
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productRecovered(productId, actorId);
  }

  async blockProduct(
    data: blockProductDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const reason = Reason.create(data.reason);
    const product = await this.productRepo.FindByIdOrThrow(productId);
    product.blockProduct(actorId, reason);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productBlocked(productId, actorId, reason);
  }

  async unBlockProduct(
    data: blockLiftProductDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const product = await this.productRepo.FindByIdOrThrow(productId);
    product.unBlockProduct(actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productUnBlocked(productId, actorId);
  }

  async makeMyProductPublic(
    data: productAppereanceDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const productId = Id.create(data.productId);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.makeProductPublic();
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productPublic(productId, actorId);
  }

  async makeMyProductPrivate(
    data: productAppereanceDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const productId = Id.create(data.productId);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.makeProductPrivate();
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.productPrivate(productId, actorId);
  }

  async updateMyProductMeta(
    data: updateProductMetaDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const title = Title.create(data.title);
    const description = Description.create(data.description);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.updateMeta(title, description, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.metaUpdated(productId, actorId);
  }

  async toggleMyProductDisclaimer(
    data: toggleDiscalimerDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    if (data.enable) product.enableDisclaimer(actorId);
    else product.disableDisclaimer(actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    if (data.enable) return productMessages.disclaimerEnabled(productId, actorId);
    else return productMessages.disclaimerDisabled(productId, actorId);
  }

  async addMyProductDisclaimers(
    data: disclaimerItemsDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.addDisclaimers(data.items, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.disclaimerUpdated(productId, actorId);
  }

  async removeMyProductDisclaimers(
    data: disclaimerItemsDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.removeDisclaimers(data.items, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.disclaimerUpdated(productId, actorId);
  }

  async addMyProductImages(
    data: imagesDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    const resolvedImages = await Promise.all(
      data.images.map((value) => this.resolveImage(value.url, 'products')),
    );
    const images = data.images.map((value, index) =>
      ImageVO.create(
        resolvedImages[index].url,
        AltVO.create(value.alt),
        value.isDefault,
        resolvedImages[index].imageKey,
      ),
    );
    product.addImages(images, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.imageUpdated(productId, actorId);
  }

  async setMyProductDefaultImage(
    data: deafultImageDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    const index = Quantity.create(data.index);
    product.setDefault(index, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.imageDefault(index, productId, actorId);
  }

  async removeMyProductImages(
    data: imagesDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    const removedRefs = new Set(data.images.map((value) => value.url));
    const removedKeys = product.images.value
      .filter((image) => removedRefs.has(image.url.value))
      .map((image) => image.imageKey)
      .filter((key): key is string => Boolean(key));
    const urls = data.images.map((value) => UrlVO.create(value.url));
    product.removeImages(urls, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    await Promise.all(removedKeys.map((key) => this.deleteImage(key)));
    return productMessages.imageUpdated(productId, actorId);
  }

  async toggleMyProductIngredients(
    data: toggleIngredientsDtoType,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    if (data.enable) product.enableIngredients(actorId);
    else product.disableIngredients(actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    if (data.enable) return productMessages.ingredientsEnabled(productId, actorId);
    else return productMessages.ingredientsDisabled(productId, actorId);
  }

  async addMyProductIngredients(
    data: ingredientsDtotype,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.addIngredients(data.items, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.ingredientsUpdated(productId, actorId);
  }

  async removeMyProductIngredients(
    data: ingredientsDtotype,
    actor: AuthActor,
  ): Promise<productMessagesType> {
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User don,t own an vendor',
    );
    const vendorId = Id.create(vendor.id);
    const product = await this.productRepo.EnsureOwnerShipOrThrow(productId, vendorId);
    product.removeIngredients(data.items, actorId);
    await this.productRepo.Save(product);
    await this.publishEvents(product);
    return productMessages.ingredientsUpdated(productId, actorId);
  }

  // Public: only non-deleted, non-blocked, public-appearance products
  async findPublicPaginatedProducts(query: GetPaginatedProductsQueryDto) {
    const filter: FilterQuery<ProductPersistence> = {
      'deleted.deleted': false,
      'block.blocked': false,
      appearance: 'public',
    };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.vendorId) filter.vendorId = query.vendorId;
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' } as any;
    }

    const result = await this.productRepo.FindPaginatedSorted({
      filter,
      sort: query.sort,
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((aggregate) => ProductMapper.aggregateToResponseReadModel(aggregate)),
      meta: result.meta,
    };
  }

  // Admin: all products regardless of deleted / blocked / appearance state
  async findAdminPaginatedProducts(query: GetAdminPaginatedProductsQueryDto) {
    const filter: FilterQuery<ProductPersistence> = {};
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.vendorId) filter.vendorId = query.vendorId;
    if (query.appearance) filter.appearance = query.appearance;
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' } as any;
    }
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    if (query.blocked !== undefined) filter['block.blocked'] = query.blocked;

    const result = await this.productRepo.FindPaginatedSorted({
      filter,
      sort: query.sort,
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((aggregate) =>
        ProductMapper.aggregateToAdminResponseReadModel(aggregate),
      ),
      meta: result.meta,
    };
  }

  // Vendor's own products: scope is derived from the actor, never from the client.
  async findMyPaginatedProducts(query: GetMyPaginatedProductsQueryDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const vendor = this.ensureFound(
      await this.queryBus.execute(new GetVendorByUserIdQuery({ userId: actorId })),
      'User does not own a vendor',
    );
    const vendorId = Id.create(vendor.id);

    const filter: FilterQuery<ProductPersistence> = {
      vendorId: vendorId.value,
      'deleted.deleted': false,
    };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.appearance) filter.appearance = query.appearance;
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' } as any;
    }

    const result = await this.productRepo.FindPaginatedSorted({
      filter,
      sort: query.sort,
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((aggregate) =>
        ProductMapper.aggregateToAdminResponseReadModel(aggregate),
      ),
      meta: result.meta,
    };
  }
}
