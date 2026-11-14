import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import {
  type AddressVO,
  DeleteInfoVO,
  Description,
  EffectiveDate,
  type EmailVO,
  type Id,
  type PhoneNumber,
  Quantity,
  type Reason,
  Slug,
  Title,
  type UrlVO,
} from '../../value-objects';
import { VendorCreatedEvent } from './events/create-vendor.event';
import { VendorDeletedEvent } from './events/delete-vendor.event';
import { VendorRecoverEvent } from './events/recover-vendor.event';
import { VendorVerificationRejectedEvent } from './events/reject-vendor.event';
import { VendorContactUpdatedEvent } from './events/vendor-contact-updated.event';
import { VendorImageUpdatedEvent } from './events/vendor-image-updated.event';
import { VendorMetaUpdatedEvent } from './events/vendor-meta-updated.event';
import { VendorStatsRefreshToggledEvent } from './events/vendor-stats-refresh-toggled.event';
import { VendorVerifiedEvent } from './events/verify-vendor.event';
import type { ContactInfoVO } from './value-objects/contact-info.vo';

import type { ImageInfoVO } from './value-objects/image-info.vo';

import { VerificationInfoVO } from './value-objects/verification-info.vo';

type CreateVendorProps = {
  id: Id;
  ownerId: Id;
  tittle: Title;
  description: Description;
  contacts: ContactInfoVO;
  image: ImageInfoVO;
  slug: Slug;
};

export class VendorAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _ownerId: Id,
    private _title: Title,
    private _slug: Slug,
    private _description: Description,
    private _verification: VerificationInfoVO,
    private _delete: DeleteInfoVO,
    private _image: ImageInfoVO,
    private _contact: ContactInfoVO,
    private _version: Quantity,
    private readonly _createdAt: EffectiveDate,
    private _statsRefreshEnabled: boolean = true,
  ) {
    super();
  }

  get version() {
    return this._version;
  }

  get id() {
    return this._id;
  }

  get ownerId() {
    return this._ownerId;
  }

  get title() {
    return this._title;
  }

  get slug() {
    return this._slug;
  }

  get description() {
    return this._description;
  }

  get verification() {
    return this._verification;
  }

  get delete() {
    return this._delete;
  }

  get image() {
    return this._image;
  }

  get contact() {
    return this._contact;
  }
  get createdAt() {
    return this._createdAt;
  }

  get statsRefreshEnabled(): boolean {
    return this._statsRefreshEnabled;
  }

  static create(props: CreateVendorProps): VendorAggregate {
    return new VendorAggregate(
      props.id,
      props.ownerId,
      props.tittle,
      props.slug,
      props.description,

      VerificationInfoVO.none(),
      DeleteInfoVO.none(),
      props.image,
      props.contacts,
      new Quantity(0),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    id: Id,
    ownerId: Id,
    title: Title,
    slug: Slug,
    description: Description,

    verification: VerificationInfoVO,
    deleteInfo: DeleteInfoVO,
    image: ImageInfoVO,
    contact: ContactInfoVO,
    quantity: Quantity,
    createdAt: EffectiveDate,
    statsRefreshEnabled: boolean = true,
  ): VendorAggregate {
    return new VendorAggregate(
      id,
      ownerId,
      title,
      slug,
      description,
      // stats,
      verification,
      deleteInfo,
      image,
      contact,
      quantity,
      createdAt,
      statsRefreshEnabled,
    );
  }
  raiseCreated(id: Id, ownerId: Id, title: Title, slug: Slug) {
    this.raise(
      new VendorCreatedEvent({ vendorId: id, ownerId: ownerId, title: title, slug: slug }),
    );
  }

  verifyVendor(actor: Id) {
    this.ensureActive();
    // Ids are values: reference equality would let an owner verify their own vendor.
    if (this._ownerId.equals(actor)) {
      throw new BadRequestError('You cannot verify your own vendor.');
    }
    this._verification = this._verification.verify(EffectiveDate.today());
    this.raise(
      new VendorVerifiedEvent({
        vendorId: this._id,
        ownerId: this._ownerId,
        verificationInfo: this.verification,
      }),
    );
  }

  rejectVerification(actor: Id, reason: Reason) {
    this.ensureActive();
    if (this._ownerId.equals(actor)) {
      throw new BadRequestError('You cannot reject the verification of your own vendor.');
    }
    this._verification = this._verification.reject(reason);
    this.raise(
      new VendorVerificationRejectedEvent({
        vendorId: this._id,
        ownerId: this._ownerId,
        rejectionInfo: this._verification,
      }),
    );
  }

  updateImage(logo: UrlVO, banner: UrlVO, logoKey?: string, bannerKey?: string) {
    this.ensureActive();
    this._image = this._image.changeBanner(banner, bannerKey);
    this._image = this.image.changeLogo(logo, logoKey);
    this.raise(new VendorImageUpdatedEvent({ vendorId: this._id, ownerId: this._ownerId }));
  }

  updateContact(phone: PhoneNumber, email: EmailVO, address: AddressVO) {
    this.ensureActive();
    this._contact = this._contact.changePhone(phone);
    this._contact = this._contact.changeEmail(email);
    this._contact = this._contact.changeAddress(address);
    this.raise(new VendorContactUpdatedEvent({ vendorId: this._id, ownerId: this._ownerId }));
  }

  updatedMeta(title: Title, slug: Slug, description: Description): void {
    this.ensureActive();
    this._title = Title.create(title.value);
    this._slug = Slug.create(slug.value);
    this._description = Description.create(description.value);
    this.raise(new VendorMetaUpdatedEvent({ vendorId: this._id, ownerId: this._ownerId }));
  }

  deleteVendor(actor: Id, reason: Reason): void {
    if (this._delete.isDeleted) throw new BadRequestError('This vendor has already been deleted.');
    this._delete = DeleteInfoVO.create(actor, reason);
    this.raise(
      new VendorDeletedEvent({
        vendorId: this._id,
        ownerId: this._ownerId,
        deletionInfo: this._delete,
      }),
    );
  }

  recoverVendor(actor: Id) {
    if (!this._delete.isDeleted) {
      throw new BadRequestError('This vendor is not deleted.');
    }
    if (this._ownerId.equals(actor)) {
      throw new BadRequestError('You cannot recover your own vendor.');
    }
    this._delete = DeleteInfoVO.none();
    this.raise(
      new VendorRecoverEvent({
        vendorId: this._id,
        performedBy: actor,
      }),
    );
  }

  setStatsRefreshEnabled(enabled: boolean) {
    this.ensureActive();
    this.raise(
      new VendorStatsRefreshToggledEvent({
        vendorId: this._id,
        ownerId: this._ownerId,
        enabled,
      }),
    );
    this._statsRefreshEnabled = enabled;
  }

  private ensureActive(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('This vendor is deleted.');
    }
  }
}
