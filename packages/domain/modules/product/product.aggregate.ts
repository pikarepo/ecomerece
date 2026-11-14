import type { desclaimerItem, Metrics } from '../../../shared';
import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { emptyMetrics } from '../../shared/metrics';
import {
  AppearanceVO,
  BlockInfoVO,
  DeleteInfoVO,
  type Description,
  EffectiveDate,
  type Id,
  type ImageVO,
  Money,
  Name,
  Quantity,
  type Reason,
  Title,
  type UrlVO,
} from '../../value-objects';
import { ProductBlockedEvent } from './events/product-blocked.event';
import { ProductCreatedEvent } from './events/product-created.event';
import { ProductDefaultImageSetEvent } from './events/product-default-image-set.event';
import { ProductDeletedEvent } from './events/product-deleted.event';
import { ProductDisclaimerDisabledEvent } from './events/product-disclaimer-disabled.event';
import { ProductDisclaimerEnabledEvent } from './events/product-disclaimer-enabled.event';
import { ProductDisclaimerUpdatedEvent } from './events/product-disclaimer-updated.event';
import { ProductDisclaimersAddedEvent } from './events/product-disclaimers-added.event';
import { ProductDisclaimersRemovedEvent } from './events/product-disclaimers-removed.event';
import { ProductImagesAddedEvent } from './events/product-images-added.event';
import { ProductImagesRemovedEvent } from './events/product-images-removed.event';
import { ProductInStockUpdatedEvent } from './events/product-in-stock-updated.event';
import { ProductIngredientsAddedEvent } from './events/product-ingredients-added.event';
import { ProductIngredientsClearedEvent } from './events/product-ingredients-cleared.event';
import { ProductIngredientsDisabledEvent } from './events/product-ingredients-disabled.event';
import { ProductIngredientsEnabledEvent } from './events/product-ingredients-enabled.event';
import { ProductIngredientsRemovedEvent } from './events/product-ingredients-removed.event';
import { ProductMadePrivateEvent } from './events/product-made-private.event';
import { ProductMadePublicEvent } from './events/product-made-public.event';
import { ProductMetaUpdatedEvent } from './events/product-meta-updated.event';
import { ProductPricingSummaryUpdatedEvent } from './events/product-pricing-summary-updated.event';
import { ProductRatingSummaryUpdatedEvent } from './events/product-rating-summary-updated.event';
import { ProductRecoveredEvent } from './events/product-recovered.event';
import { ProductUnblockedEvent } from './events/product-unblocked.event';
import type { DisclaimerVO } from './value-objects/disclaimer.vo';
import type { IngredientsVO } from './value-objects/ingredients.vo';
import type { ImagesVO } from './value-objects/product-images.vo';

type CreateVendorProps = {
  id: Id;
  vendorId: Id;
  vendorTitle: Title;
  categoryId: Id;
  images: ImagesVO;
  title: Title;
  description: Description;
  ingredients: IngredientsVO;
  disclaimer: DisclaimerVO;
};

export class ProductAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _vendorId: Id,
    private readonly _categoryId: Id,
    private readonly _vendorTitle: Title,
    private _inStock: boolean = false,
    private _title: Title,
    private _description: Description,
    private _ingredients: IngredientsVO,
    private _disclaimer: DisclaimerVO,
    private _images: ImagesVO,
    private _delete: DeleteInfoVO,
    private _block: BlockInfoVO,
    private _appearance: AppearanceVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
    private _minPrice: Money,
    private _maxPrice: Money,
    private _minDiscountedPrice: Money,
    private _maxDiscountedPrice: Money,
    private _averageRating: Quantity,
    private _totalReviews: Quantity,
    private readonly _stats: Metrics = emptyMetrics(),
  ) {
    super();
  }

  get categoryId(): Id {
    return this._categoryId;
  }
  get vendorTitle(): Title {
    return this._vendorTitle;
  }

  get id(): Id {
    return this._id;
  }
  get inStock(): boolean {
    return this._inStock;
  }
  get vendorId(): Id {
    return this._vendorId;
  }

  get title(): Title {
    return this._title;
  }

  get description(): Description {
    return this._description;
  }

  get ingredients(): IngredientsVO {
    return this._ingredients;
  }

  get disclaimer(): DisclaimerVO {
    return this._disclaimer;
  }

  get images(): ImagesVO {
    return this._images;
  }

  get delete(): DeleteInfoVO {
    return this._delete;
  }

  get block(): BlockInfoVO {
    return this._block;
  }

  get appearance(): AppearanceVO {
    return this._appearance;
  }

  get version(): Quantity {
    return this._version;
  }

  get createdAt(): EffectiveDate {
    return this._createdAt;
  }

  get minPrice(): Money {
    return this._minPrice;
  }

  get maxPrice(): Money {
    return this._maxPrice;
  }

  get minDiscountedPrice(): Money {
    return this._minDiscountedPrice;
  }

  get maxDiscountedPrice(): Money {
    return this._maxDiscountedPrice;
  }

  get averageRating(): Quantity {
    return this._averageRating;
  }

  get totalReviews(): Quantity {
    return this._totalReviews;
  }

  get stats(): Metrics {
    return this._stats;
  }

  get hasMultipleVariants(): boolean {
    return !this._minPrice.equals(this._maxPrice);
  }

  static create(data: CreateVendorProps): ProductAggregate {
    const product = new ProductAggregate(
      data.id,
      data.vendorId,
      data.categoryId,
      data.vendorTitle,
      false,
      data.title,
      data.description,
      data.ingredients,
      data.disclaimer,
      data.images,
      DeleteInfoVO.none(),
      BlockInfoVO.none(),
      AppearanceVO.create('public'),
      Quantity.none(),
      EffectiveDate.today(),
      Money.zero(),
      Money.zero(),
      Money.zero(),
      Money.zero(),
      Quantity.none(),
      Quantity.zero(),
    );
    product.raise(
      new ProductCreatedEvent({
        productId: product._id,
        vendorId: product._vendorId,
        categoryId: product._categoryId,
      }),
    );

    return product;
  }

  static rehydrate(
    _id: Id,
    _vendorId: Id,
    _categoryId: Id,
    _vendorTitle: Title,
    _title: Title,
    _inStock: boolean,
    _description: Description,
    _ingredients: IngredientsVO,
    _disclaimer: DisclaimerVO,
    _images: ImagesVO,
    _delete: DeleteInfoVO,
    _block: BlockInfoVO,
    _appearance: AppearanceVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
    _minPrice: Money,
    _maxPrice: Money,
    _minDiscountedPrice: Money,
    _maxDiscountedPrice: Money,
    _averageRating: Quantity,
    _totalReviews: Quantity,
    _stats: Metrics = emptyMetrics(),
  ): ProductAggregate {
    return new ProductAggregate(
      _id,
      _vendorId,
      _categoryId,
      _vendorTitle,
      _inStock,
      _title,
      _description,
      _ingredients,
      _disclaimer,
      _images,
      _delete,
      _block,
      _appearance,
      _version,
      _createdAt,
      _minPrice,
      _maxPrice,
      _minDiscountedPrice,
      _maxDiscountedPrice,
      _averageRating,
      _totalReviews,
      _stats,
    );
  }

  updatePricingSummary(
    minPrice: Money,
    maxPrice: Money,
    minDiscountedPrice: Money,
    maxDiscountedPrice: Money,
    _actorId?: Id,
  ): void {
    this._minPrice = minPrice;
    this._maxPrice = maxPrice;
    this._minDiscountedPrice = minDiscountedPrice;
    this._maxDiscountedPrice = maxDiscountedPrice;
    this.raise(
      new ProductPricingSummaryUpdatedEvent({
        productId: this._id,
        vendorId: this._vendorId,
        minPrice,
        maxPrice,
        minDiscountedPrice,
        maxDiscountedPrice,
      }),
    );
  }

  updateRatingSummary(averageRating: number, totalReviews: number): void {
    if (averageRating < 0 || averageRating > 5) {
      throw new BadRequestError('Rating must be between 0 and 5.');
    }
    if (totalReviews < 0) {
      throw new BadRequestError('The total number of reviews cannot be negative.');
    }
    this._averageRating = Quantity.create(Math.round(averageRating * 10) / 10);
    this._totalReviews = Quantity.create(totalReviews);
    this.raise(
      new ProductRatingSummaryUpdatedEvent({
        productId: this._id,
        averageRating: this._averageRating,
        totalReviews: this._totalReviews,
      }),
    );
  }

  recoverProduct(): void {
    if (!this._delete.deleted)
      throw new BadRequestError('This product has already been recovered.');
    this._delete = DeleteInfoVO.none();
    this.raise(new ProductRecoveredEvent({ productId: this._id }));
  }

  deleteProduct(actor: Id, reason: Reason): void {
    if (this._delete.deleted) throw new BadRequestError('This product has already been removed.');
    this._delete = DeleteInfoVO.create(actor, reason);
    this.raise(
      new ProductDeletedEvent({ productId: this._id, actorId: actor, deletionInfo: this._delete }),
    );
  }

  blockProduct(actor: Id, reason: Reason): void {
    if (this._block.isBlocked) throw new BadRequestError('This product is already blocked.');
    this._block = this._block.block(actor, reason);
    this.raise(
      new ProductBlockedEvent({ productId: this._id, actorId: actor, blockInfo: this._block }),
    );
  }

  unBlockProduct(actor: Id): void {
    if (!this._block.isBlocked) throw new BadRequestError('This product is not blocked.');
    this._block = this._block.unblock();
    this.raise(new ProductUnblockedEvent({ productId: this._id, actorId: actor }));
  }

  makeProductPublic(): void {
    this.ensureNotDeleted();
    if (this._appearance.isPublic) throw new BadRequestError('This product is already public.');
    this._appearance = this._appearance.makePublic();
    this.raise(new ProductMadePublicEvent({ productId: this._id }));
  }

  makeProductPrivate(): void {
    this.ensureNotDeleted();
    if (this._appearance.isPrivate) throw new BadRequestError('This product is already private.');
    this._appearance = this._appearance.makePrivate();
    this.raise(new ProductMadePrivateEvent({ productId: this._id }));
  }

  updateMeta(title: Title, description: Description, actorId: Id): void {
    this.ensureNotDeleted();
    this._title = title;
    this._description = description;
    this.raise(new ProductMetaUpdatedEvent({ productId: this._id, actorId }));
  }

  enableDisclaimer(actorId: Id) {
    this.ensureNotDeleted();
    this._disclaimer = this._disclaimer.enable();
    this.raise(new ProductDisclaimerEnabledEvent({ productId: this._id, actorId }));
  }

  disableDisclaimer(actorId: Id) {
    this.ensureNotDeleted();
    this._disclaimer = this._disclaimer.disable();
    this.raise(new ProductDisclaimerDisabledEvent({ productId: this._id, actorId }));
  }

  addDisclaimers(data: desclaimerItem[], actorId: Id) {
    this.ensureNotDeleted();
    const items = data.map((value) => ({
      name: Name.create(value.name),
      title: Title.create(value.title),
    }));
    this._disclaimer = this._disclaimer.addMany(items);
    this.raise(new ProductDisclaimersAddedEvent({ productId: this._id, actorId, items }));
  }

  setInStock(inStock: boolean, actorId: Id) {
    this._inStock = inStock;
    this.raise(new ProductInStockUpdatedEvent({ productId: this._id, actorId, inStock }));
  }

  removeDisclaimers(data: desclaimerItem[], actorId: Id) {
    this.ensureNotDeleted();
    const items = data.map((value) => ({
      name: Name.create(value.name),
      title: Title.create(value.title),
    }));
    this._disclaimer = this._disclaimer.removeMany(items);
    this.raise(new ProductDisclaimersRemovedEvent({ productId: this._id, actorId, items }));
  }

  updateDisclaimer(name: Name, title: Title, actorId: Id) {
    this.ensureNotDeleted();
    this._disclaimer = this._disclaimer.update(name.value, title.value);
    this.raise(new ProductDisclaimerUpdatedEvent({ productId: this._id, actorId, name, title }));
  }

  addImages(images: ImageVO | ImageVO[], actorId: Id): void {
    this.ensureNotDeleted();
    this._images = this._images.add(images);
    this.raise(new ProductImagesAddedEvent({ productId: this._id, actorId, images }));
  }

  removeImages(urls: UrlVO | UrlVO[], actorId: Id): void {
    this.ensureNotDeleted();
    this._images = this._images.remove(urls);
    this.raise(new ProductImagesRemovedEvent({ productId: this._id, actorId, urls }));
  }

  setDefault(index: Quantity, actorId: Id) {
    this.ensureNotDeleted();
    this._images = this._images.setDefault(index);
    this.raise(new ProductDefaultImageSetEvent({ productId: this._id, actorId, index }));
  }

  hasImage(url: UrlVO): boolean {
    return this._images.has(url);
  }

  getDefaultImage(): ImageVO | undefined {
    return this._images.getDefault();
  }

  getImages(): ImagesVO {
    return this._images;
  }

  getFirstImage() {
    return this._images.first();
  }

  getLastImage() {
    return this._images.last();
  }

  getImagesCount(): number {
    return this._images.length;
  }

  hasImages(): boolean {
    return !this._images.isEmpty;
  }

  enableIngredients(actorId: Id): void {
    this.ensureNotDeleted();
    this._ingredients = this._ingredients.enable();
    this.raise(new ProductIngredientsEnabledEvent({ productId: this._id, actorId }));
  }

  disableIngredients(actorId: Id): void {
    this.ensureNotDeleted();
    this._ingredients = this._ingredients.disable();
    this.raise(new ProductIngredientsDisabledEvent({ productId: this._id, actorId }));
  }

  addIngredients(items: string | string[], actorId: Id): void {
    this.ensureNotDeleted();
    const ingredientList = Array.isArray(items) ? items : [items];
    const added: string[] = [];

    ingredientList.forEach((ingredient) => {
      if (ingredient?.trim()) {
        this._ingredients.add(ingredient);
        added.push(ingredient);
      }
    });
    this.raise(new ProductIngredientsAddedEvent({ productId: this._id, actorId, items: added }));
  }

  removeIngredients(items: string | string[], actorId: Id): void {
    this.ensureNotDeleted();
    const ingredientList = Array.isArray(items) ? items : [items];
    const removed: string[] = [];

    ingredientList.forEach((ingredient) => {
      if (ingredient?.trim()) {
        this._ingredients.remove(ingredient);
        removed.push(ingredient);
      }
    });
    this.raise(
      new ProductIngredientsRemovedEvent({ productId: this._id, actorId, items: removed }),
    );
  }

  clearIngredients(actorId: Id): void {
    this.ensureNotDeleted();
    this._ingredients = this._ingredients.clear();
    this.raise(new ProductIngredientsClearedEvent({ productId: this._id, actorId }));
  }

  hasIngredient(item: string): boolean {
    return this._ingredients.has(item);
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('This product has been deleted.');
    }
  }
}
