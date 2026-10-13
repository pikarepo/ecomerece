import { AggregateRoot } from '../../aggregate-root';
import {
  BlockInfoVO,
  DeleteInfoVO,
  EffectiveDate,
  type Id,
  Quantity,
  type Reason,
  type Title,
  type UrlVO,
} from '../../value-objects';
import type { ImageKey } from '../image-storage/value-objects/image-key.vo';
import { CategoryBlockedEvent } from './events/category-blocked.event';
import { CategoryCreatedEvent } from './events/category-created.event';
import { CategoryDeletedEvent } from './events/category-deleted.event';
import { CategoryImageUpdatedEvent } from './events/category-image-updated.event';
import { CategoryMetaUpdatedEvent } from './events/category-meta-updated.event';
import { CategoryRecoveredEvent } from './events/category-recovered.event';

export type createCategoryProps = {
  id: Id;
  title: Title;
  image: UrlVO;
  createdBy: Id;
  imageKey?: ImageKey;
};

export class CategoryAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private _title: Title,
    private readonly _createdBy: Id,
    private _delete: DeleteInfoVO,
    private _image: UrlVO,
    private _block: BlockInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
    private _imageKey?: ImageKey,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get image() {
    return this._image;
  }
  get createdBy() {
    return this._createdBy;
  }
  get delete() {
    return this._delete;
  }
  get block() {
    return this._block;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }
  get imageKey() {
    return this._imageKey;
  }

  static create(data: createCategoryProps): CategoryAggregate {
    const category = new CategoryAggregate(
      data.id,
      data.title,
      data.createdBy,
      DeleteInfoVO.none(),
      data.image,
      BlockInfoVO.none(),
      Quantity.create(0),
      EffectiveDate.today(),
      data.imageKey,
    );
    category.raise(
      new CategoryCreatedEvent({ categoryId: category._id, createdBy: category._createdBy }),
    );

    return category;
  }
  static rehydrate(
    _id: Id,
    title: Title,
    _createdBy: Id,
    _delete: DeleteInfoVO,
    _image: UrlVO,
    _block: BlockInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
    _imageKey?: ImageKey,
  ): CategoryAggregate {
    return new CategoryAggregate(
      _id,
      title,
      _createdBy,
      _delete,
      _image,
      _block,
      _version,
      _createdAt,
      _imageKey,
    );
  }

  updateMeta(title: Title, actorId: Id) {
    this._title = title;
    this.raise(new CategoryMetaUpdatedEvent({ categoryId: this._id, actorId }));
  }
  updateImage(image: UrlVO, imageKey?: ImageKey) {
    this._image = image;
    this._imageKey = imageKey;
    this.raise(new CategoryImageUpdatedEvent({ categoryId: this._id, image }));
  }

  deleteCategory(reason: Reason, actorId: Id) {
    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(
      new CategoryDeletedEvent({ categoryId: this._id, actorId, deletionInfo: this._delete }),
    );
  }
  recoverCategory(actorId: Id) {
    this._delete = DeleteInfoVO.none();
    this.raise(new CategoryRecoveredEvent({ categoryId: this._id, actorId }));
  }
  blockCategory(reason: Reason, actorId: Id) {
    this._block = BlockInfoVO.create(actorId, reason);
    this.raise(new CategoryBlockedEvent({ categoryId: this._id, actorId, blockInfo: this._block }));
  }
}
