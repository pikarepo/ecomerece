import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import {
  DeleteInfoVO,
  EffectiveDate,
  type Id,
  type Money,
  Quantity,
  type Reason,
  type Title,
} from '../../value-objects';
import { ProductVariantActivatedEvent } from './events/product-variant-activated.event';
import { ProductVariantCreatedEvent } from './events/product-variant-created.event';
import { ProductVariantDeactivatedEvent } from './events/product-variant-deactivated.event';
import { ProductVariantDeletedEvent } from './events/product-variant-deleted.event';
import { ProductVariantMetaUpdatedEvent } from './events/product-variant-meta-updated.event';
import { ProductVariantPriceUpdatedEvent } from './events/product-variant-price-updated.event';
import { ProductVariantRecoveredEvent } from './events/product-variant-recovered.event';

export type createVarientProps = {
  id: Id;
  productId: Id;
  discountedPrice: Money;
  price: Money;
  title: Title;
  active: boolean;
};

export class ProductVariantAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _productId: Id,

    private _discountedPrice: Money,
    private _price: Money,
    private _active: boolean,
    private _title: Title,
    private _delete: DeleteInfoVO,
    private _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }
  get id() {
    return this._id;
  }
  get productId() {
    return this._productId;
  }

  get price() {
    return this._price;
  }
  get discountedPrice() {
    return this._discountedPrice;
  }
  get active() {
    return this._active;
  }
  get delete() {
    return this._delete;
  }
  get title() {
    return this._title;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: createVarientProps): ProductVariantAggregate {
    if (data.price.value < data.discountedPrice.value)
      throw new BadRequestError('The discount must be lower than the actual price.');
    const variant = new ProductVariantAggregate(
      data.id,
      data.productId,

      data.discountedPrice,
      data.price,
      data.active,
      data.title,
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
    variant.raise(
      new ProductVariantCreatedEvent({ variantId: variant._id, productId: variant._productId }),
    );

    return variant;
  }

  static rehydrate(
    _id: Id,
    _productId: Id,

    _discountedPrice: Money,
    _price: Money,
    _active: boolean,
    _title: Title,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ) {
    return new ProductVariantAggregate(
      _id,
      _productId,

      _discountedPrice,
      _price,
      _active,
      _title,
      _delete,
      _version,
      _createdAt,
    );
  }

  updateMeta(title: Title, actorId: Id) {
    this._title = title;
    this.raise(
      new ProductVariantMetaUpdatedEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
      }),
    );
  }

  activate(actorId: Id) {
    if (this._active === true) throw new BadRequestError('This variant is already active.');
    this._active = true;
    this.raise(
      new ProductVariantActivatedEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
      }),
    );
  }
  deActivate(actorId: Id) {
    if (this._active === false) throw new BadRequestError('This variant is already inactive.');
    this._active = false;
    this.raise(
      new ProductVariantDeactivatedEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
      }),
    );
  }

  updatePrice(price: Money, discountedPrice: Money, actorId: Id) {
    if (price < discountedPrice)
      throw new BadRequestError('The discount must be lower than the actual price.');
    this._price = price;
    this._discountedPrice = discountedPrice;
    this.raise(
      new ProductVariantPriceUpdatedEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
      }),
    );
  }

  deleteProduct(actorId: Id, reason: Reason) {
    if (this._delete.deleted)
      throw new BadRequestError('This product variant has already been removed.');
    this._delete = DeleteInfoVO.create(actorId, reason);
    this._active = false;
    this.raise(
      new ProductVariantDeletedEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
        deletionInfo: this._delete,
      }),
    );
  }

  recoverProduct(actorId: Id) {
    if (!this._delete.deleted)
      throw new BadRequestError('This product variant has already been recovered.');
    this._delete = DeleteInfoVO.none();
    this.raise(
      new ProductVariantRecoveredEvent({
        variantId: this._id,
        productId: this._productId,
        actorId,
      }),
    );
  }
}
