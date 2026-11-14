import type { AuthActor } from '@ecomerece/contracts';
import {
  ContactInfoVO,
  type IImageStoragePort,
  ImageInfoVO,
  ImageKey,
  ImageSource,
  VendorAggregate,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { Description } from '@ecomerece/domain/value-objects/description.vo';
import { EmailVO } from '@ecomerece/domain/value-objects/email.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { PhoneNumber } from '@ecomerece/domain/value-objects/phone-no.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Slug } from '@ecomerece/domain/value-objects/slug.vo';
import {
  AddressVO,
  CityVO,
  CountryVO,
  PostalCodeVO,
  StateVO,
  StreetAddressVO,
} from '@ecomerece/domain/value-objects/street-address.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
import type {
  CreateVendorDto,
  DeleteMyVendorDto,
  DeleteVendorDto,
  GetAdminPaginatedVendorsQueryDto,
  GetPaginatedVendorsQueryDto,
  RecoverVendorDto,
  RejectVendorDto,
  UpdateMyVendorContactDto,
  UpdateMyVendorImageDto,
  UpdateMyVendorMetaDto,
  VendorListItemReadModel,
  VendorResponseReadModel,
  VerifyVendorDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import { BaseService } from '../../../core/services/base.services';
import { VendorMapper } from '../infrastructure/vendor.mapper';
import type { VendorPersistence } from '../infrastructure/vendor.models';
import type { VendorRepository } from '../infrastructure/vendor.repository';
import { VendorMessages, type VendorMessagesType } from '../presentation/vendor.messages';
import type { VendorInternalService } from './vendor.internal.service';

const VENDOR_COLLATION = { locale: 'en', strength: 2 };

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class VendorAppService extends BaseService {
  constructor(
    private readonly vendorRepo: VendorRepository,
    private readonly eventBus: IEventBus,
    private readonly internalService: VendorInternalService,
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
        `[vendor] failed to clean up stored image '${key}':`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  private async toResponseReadModel(vendor: VendorAggregate): Promise<VendorResponseReadModel> {
    const stats = await this.vendorRepo.getStatsById(vendor.id);
    return VendorMapper.aggregateToResponseReadModel(vendor, stats ?? undefined);
  }

  private async publishEvents(vendor: VendorAggregate): Promise<void> {
    const events = vendor.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async createMyVendor(data: CreateVendorDto, actor: AuthActor): Promise<VendorMessagesType> {
    const actorId = Id.create(actor._id);
    await this.internalService.canCreateVendor(actorId);

    const id = Id.create();
    const address = AddressVO.create(
      StreetAddressVO.create(data.contacts.address.streetAddress),
      CityVO.create(data.contacts.address.city),
      StateVO.create(data.contacts.address.state),
      PostalCodeVO.create(data.contacts.address.postalCode),
      CountryVO.create(data.contacts.address.country),
    );
    const contacts = ContactInfoVO.create(
      PhoneNumber.create(data.contacts.phone),
      EmailVO.create(data.contacts.email),
      address,
    );
    const tittle = Title.create(data.title);
    const description = Description.create(data.description);
    const [logo, banner] = await Promise.all([
      this.resolveImage(data.image.logo, 'vendors'),
      this.resolveImage(data.image.banner, 'vendors'),
    ]);
    const image = ImageInfoVO.create(logo.url, banner.url, logo.imageKey, banner.imageKey);
    const slug = Slug.create(data.slug);
    const newVendor = VendorAggregate.create({
      id: id,
      ownerId: actorId,
      contacts,
      tittle,
      description,
      image,
      slug,
    });
    newVendor.raiseCreated(id, actorId, tittle, slug);

    try {
      await this.vendorRepo.Create(newVendor);
    } catch (error) {
      const uploadedKeys = [logo.imageKey, banner.imageKey].filter((key): key is string =>
        Boolean(key),
      );
      await Promise.allSettled(uploadedKeys.map((key) => this.deleteImage(key)));
      throw error;
    }
    await this.publishEvents(newVendor);

    return VendorMessages.createdVendor(id, actorId);
  }

  async getVendorById(id: string): Promise<VendorResponseReadModel> {
    const vendorId = Id.create(id);
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    const stats = await this.vendorRepo.getStatsById(vendor.id);
    return VendorMapper.aggregateToResponseReadModel(vendor, stats ?? undefined);
  }

  async getMyVendor(actorId: Id): Promise<VendorResponseReadModel | null> {
    const vendor = await this.vendorRepo.FindByOwnerId(actorId);
    if (!vendor) return null;
    return this.toResponseReadModel(vendor);
  }

  async updateMyVendorMeta(
    data: UpdateMyVendorMetaDto,
    actor: AuthActor,
  ): Promise<VendorResponseReadModel> {
    const actorId = Id.create(actor._id);
    const vendor = await this.vendorRepo.FindByOwnerIdOrThrow(actorId);
    vendor.updatedMeta(
      Title.create(data.title),
      Slug.create(data.slug),
      Description.create(data.description),
    );
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);
    return this.toResponseReadModel(vendor);
  }

  async updateMyVendorContact(
    data: UpdateMyVendorContactDto,
    actor: AuthActor,
  ): Promise<VendorResponseReadModel> {
    const actorId = Id.create(actor._id);
    const vendor = await this.vendorRepo.FindByOwnerIdOrThrow(actorId);
    vendor.updateContact(
      PhoneNumber.create(data.phone),
      EmailVO.create(data.email),
      AddressVO.create(
        StreetAddressVO.create(data.address.streetAddress),
        CityVO.create(data.address.city),
        StateVO.create(data.address.state),
        PostalCodeVO.create(data.address.postalCode),
        CountryVO.create(data.address.country),
      ),
    );
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);
    return this.toResponseReadModel(vendor);
  }

  async updateMyVendorImage(
    data: UpdateMyVendorImageDto,
    actor: AuthActor,
  ): Promise<VendorResponseReadModel> {
    const actorId = Id.create(actor._id);
    const vendor = await this.vendorRepo.FindByOwnerIdOrThrow(actorId);
    const previousKeys = [vendor.image.logoKey, vendor.image.bannerKey].filter(
      (key): key is string => Boolean(key),
    );
    const [logo, banner] = await Promise.all([
      this.resolveImage(data.logo, 'vendors'),
      this.resolveImage(data.banner, 'vendors'),
    ]);
    vendor.updateImage(logo.url, banner.url, logo.imageKey, banner.imageKey);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);
    const currentKeys = [logo.imageKey, banner.imageKey].filter((key): key is string =>
      Boolean(key),
    );
    await Promise.all(
      previousKeys.filter((key) => !currentKeys.includes(key)).map((key) => this.deleteImage(key)),
    );
    return this.toResponseReadModel(vendor);
  }

  async findPaginatedVendors(query: GetPaginatedVendorsQueryDto) {
    const filter: FilterQuery<VendorPersistence> = {
      'deleted.deleted': false,
    };
    if (query.search) {
      filter.title = { $regex: `^${escapeRegex(query.search)}` };
    }

    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.vendorRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
      collation: VENDOR_COLLATION,
    });

    const statsByIds = await this.vendorRepo.getStatsByIds(result.data.map((v) => v.id));

    const data: VendorListItemReadModel[] = result.data.map((aggregate) => ({
      id: aggregate.id.value,
      title: aggregate.title.value,
      slug: aggregate.slug.value,
      stats: statsByIds.get(aggregate.id.value),
    }));

    return {
      data,
      meta: result.meta,
    };
  }

  async findAdminPaginatedVendors(query: GetAdminPaginatedVendorsQueryDto) {
    // Admin: all vendors — no baseline restrictions
    const filter: FilterQuery<VendorPersistence> = {};
    if (query.search) {
      filter.title = { $regex: `^${escapeRegex(query.search)}` };
    }
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    if (query.verified !== undefined) filter['verification.verified'] = query.verified;
    if (query.pending) {
      filter['deleted.deleted'] = false;
      filter['verification.verified'] = false;
      filter['verification.rejectedReason'] = null;
    }

    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;

    const result = await this.vendorRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
      collation: VENDOR_COLLATION,
    });

    const statsByIds = await this.vendorRepo.getStatsByIds(result.data.map((v) => v.id));

    const data: VendorListItemReadModel[] = result.data.map((aggregate) => ({
      id: aggregate.id.value,
      title: aggregate.title.value,
      slug: aggregate.slug.value,
      stats: statsByIds.get(aggregate.id.value),
      images: {
        logo: aggregate.image.logo.value,
        banner: aggregate.image.banner.value,
      },
      verification: {
        isVerified: aggregate.verification.isVerified,
        rejectedReason: aggregate.verification.rejectedReason?.value ?? null,
      },
      isDeleted: aggregate.delete.isDeleted,
      createdAt: aggregate.createdAt.value,
    }));

    return {
      data,
      meta: result.meta,
    };
  }

  async deleteMyVendor(data: DeleteMyVendorDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const vendor = await this.vendorRepo.FindByOwnerIdOrThrow(actorId);
    vendor.deleteVendor(actorId, reason);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);

    return VendorMessages.deletedVendor(vendor.id, actorId);
  }
  async softDeleteVendor(data: DeleteVendorDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const vendorId = Id.create(data.vendorId);
    const reason = Reason.create(data.reason);
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    vendor.deleteVendor(actorId, reason);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);

    return VendorMessages.deletedVendor(vendor.id, actorId);
  }

  async recoverVendor(data: RecoverVendorDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const vendorId = Id.create(data.vendorId);
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    vendor.recoverVendor(actorId);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);

    return VendorMessages.recoveredVendor(vendor.id, actorId);
  }

  async verifyVendor(data: VerifyVendorDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const vendorId = Id.create(data.vendorId);
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    vendor.verifyVendor(actorId);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);

    return VendorMessages.verifiedVendor(vendor.id, actorId);
  }

  async rejectVendorVerification(data: RejectVendorDto, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const vendorId = Id.create(data.vendorId);
    const reason = Reason.create(data.reason);
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    vendor.rejectVerification(actorId, reason);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);

    return VendorMessages.rejectVendorVerification(vendor.id, actorId);
  }

  async updateMyStatsRefresh(actor: AuthActor, enabled: boolean): Promise<VendorResponseReadModel> {
    const actorId = Id.create(actor._id);
    const vendor = await this.vendorRepo.FindByOwnerIdOrThrow(actorId);
    vendor.setStatsRefreshEnabled(enabled);
    await this.vendorRepo.Save(vendor);
    await this.publishEvents(vendor);
    const stats = await this.vendorRepo.getStatsById(vendor.id);
    return VendorMapper.aggregateToResponseReadModel(vendor, stats ?? undefined);
  }
}
