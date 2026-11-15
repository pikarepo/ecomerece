import type { VendorReadModel } from '@ecomerece/domain';
import {
  ContactInfoVO,
  DeleteInfoVO,
  ImageInfoVO,
  PhoneNumber,
  VendorAggregate,
  VerificationInfoVO,
} from '@ecomerece/domain';
import { Description } from '@ecomerece/domain/value-objects/description.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { EmailVO } from '@ecomerece/domain/value-objects/email.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
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
  Metrics,
  VendorPublicResponseReadModel,
  VendorResponseReadModel,
} from '@ecomerece/shared';
import type { VendorPersistenceWithId } from './vendor.models';

export const VendorMapper = {
  persistenceToAggregate(doc: VendorPersistenceWithId): VendorAggregate {
    return VendorAggregate.rehydrate(
      Id.create(doc._id.toString()),
      Id.create(doc.ownerId),
      Title.create(doc.title),
      Slug.create(doc.slug),
      Description.create(doc.description),

      VerificationInfoVO.rehydrate(
        doc.verification.isVerified,
        doc.verification.verifiedAt ? EffectiveDate.create(doc.verification.verifiedAt) : null,
        doc.verification.rejectedReason ? Reason.create(doc.verification.rejectedReason) : null,
      ),

      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.create(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),

      ImageInfoVO.rehydrate(
        UrlVO.create(doc.images.logo),
        UrlVO.create(doc.images.banner),
        (doc.images as { logoKey?: string | null }).logoKey ?? undefined,
        (doc.images as { bannerKey?: string | null }).bannerKey ?? undefined,
      ),

      ContactInfoVO.rehydrate(
        PhoneNumber.create(doc.contact.phone),
        EmailVO.create(doc.contact.email),
        AddressVO.create(
          StreetAddressVO.create(doc.contact.address.streetAddress),
          CityVO.create(doc.contact.address.city),
          StateVO.create(doc.contact.address.state),
          PostalCodeVO.create(doc.contact.address.postalCode),
          CountryVO.create(doc.contact.address.country),
        ),
      ),

      Quantity.rehydrate(doc.version),
      EffectiveDate.create(doc.createdAt),
      doc.statsRefreshEnabled ?? true,
    );
  },

  aggregateToPersistence(vendor: VendorAggregate) {
    return {
      _id: vendor.id.value,
      ownerId: vendor.ownerId.value,
      title: vendor.title.value,
      slug: vendor.slug.value,
      description: vendor.description.value,

      images: {
        logo: vendor.image.logo.value,
        banner: vendor.image.banner.value,
        logoKey: vendor.image.logoKey ?? null,
        bannerKey: vendor.image.bannerKey ?? null,
      },

      contact: {
        phone: vendor.contact.phone.value,
        email: vendor.contact.email.value,
        address: {
          streetAddress: vendor.contact.address.streetAddress.value,
          city: vendor.contact.address.city.value,
          state: vendor.contact.address.state.value,
          postalCode: vendor.contact.address.postalCode.value,
          country: vendor.contact.address.country.value,
        },
      },

      verification: {
        isVerified: vendor.verification.isVerified,
        verifiedAt: vendor.verification.verifiedAt?.value ?? null,
        rejectedReason: vendor.verification.rejectedReason?.value ?? null,
      },

      deleted: {
        deleted: vendor.delete.deleted,
        deletedFrom: vendor.delete.from?.value ?? null,
        deletedBy: vendor.delete.performedBy?.value ?? null,
        reason: vendor.delete.reason?.value ?? null,
      },

      statsRefreshEnabled: vendor.statsRefreshEnabled,
      createdAt: vendor.createdAt.value,
    };
  },

  aggregateToReadModel(vendor: VendorAggregate): VendorReadModel {
    return {
      id: vendor.id.value,
      ownerId: vendor.ownerId.value,
      title: vendor.title.value,
      slug: vendor.slug.value,
      description: vendor.description.value,
      images: {
        logo: vendor.image.logo.value,
        banner: vendor.image.banner.value,
      },
      contact: {
        phone: vendor.contact.phone.value,
        email: vendor.contact.email.value,
        address: {
          streetAddress: vendor.contact.address.streetAddress.value,
          city: vendor.contact.address.city.value,
          state: vendor.contact.address.state.value,
          postalCode: vendor.contact.address.postalCode.value,
          country: vendor.contact.address.country.value,
        },
      },

      verification: {
        isVerified: vendor.verification.isVerified,
        verifiedAt: vendor.verification.verifiedAt?.value ?? null,
        rejectedReason: vendor.verification.rejectedReason?.value ?? null,
      },
      statsRefreshEnabled: vendor.statsRefreshEnabled,
      isDeleted: vendor.delete.deleted,
    };
  },

  persistenceToReadModel(doc: VendorPersistenceWithId): VendorReadModel {
    return {
      id: doc._id.toString(),
      ownerId: doc.ownerId,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      images: {
        logo: doc.images.logo,
        banner: doc.images.banner,
      },

      contact: {
        phone: doc.contact.phone,
        email: doc.contact.email,
        address: doc.contact.address,
      },

      verification: {
        isVerified: doc.verification.isVerified,
        verifiedAt: doc.verification.verifiedAt ?? null,
        rejectedReason: doc.verification.rejectedReason ?? null,
      },
      stats: (doc.stats ?? {}) as Metrics,
      statsRefreshEnabled: doc.statsRefreshEnabled ?? true,
      isDeleted: doc.deleted.deleted,
    };
  },

  /** Storefront view: no owner account, no contact details, no internal flags. */
  aggregateToPublicResponseReadModel(vendor: VendorAggregate): VendorPublicResponseReadModel {
    return {
      id: vendor.id.value,
      title: vendor.title.value,
      slug: vendor.slug.value,
      description: vendor.description.value,
      images: {
        logo: vendor.image.logo.value,
        banner: vendor.image.banner.value,
      },
      verification: {
        isVerified: vendor.verification.isVerified,
      },
    };
  },

  aggregateToResponseReadModel(vendor: VendorAggregate, stats?: Metrics): VendorResponseReadModel {
    return {
      id: vendor.id.value,
      ownerId: vendor.ownerId.value,
      title: vendor.title.value,
      slug: vendor.slug.value,
      description: vendor.description.value,
      images: {
        logo: vendor.image.logo.value,
        banner: vendor.image.banner.value,
      },
      contact: {
        phone: vendor.contact.phone.value,
        email: vendor.contact.email.value,
        address: {
          streetAddress: vendor.contact.address.streetAddress.value,
          city: vendor.contact.address.city.value,
          state: vendor.contact.address.state.value,
          postalCode: vendor.contact.address.postalCode.value,
          country: vendor.contact.address.country.value,
        },
      },

      verification: {
        isVerified: vendor.verification.isVerified,
        verifiedAt: vendor.verification.verifiedAt?.value ?? null,
        rejectedReason: vendor.verification.rejectedReason?.value ?? null,
      },
      stats,
      statsRefreshEnabled: vendor.statsRefreshEnabled,
    };
  },
};
