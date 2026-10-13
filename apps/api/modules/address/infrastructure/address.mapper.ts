import { AddressAggregate } from '@ecomerece/domain/modules/address/address.aggregate';
import type { AddressReadModel } from '@ecomerece/domain/modules/address/read-models/address.read-models';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import {
  AddressVO,
  CityVO,
  CountryVO,
  PostalCodeVO,
  StateVO,
  StreetAddressVO,
} from '@ecomerece/domain/value-objects/street-address.vo';
import type { AddressResponseReadModel } from '@ecomerece/shared';

import type { AddressPersistence } from './address.models';

export const AddressMapper = {
  persistenceToAggregate(doc: AddressPersistence): AddressAggregate {
    return AddressAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.ownerId),
      doc.defaultDate ? EffectiveDate.rehydrate(doc.defaultDate) : null,
      AddressVO.rehydrate(
        StreetAddressVO.rehydrate(doc.streetAddress),
        CityVO.rehydrate(doc.city),
        StateVO.rehydrate(doc.state),
        PostalCodeVO.rehydrate(doc.postalCode),
        CountryVO.rehydrate(doc.country),
      ),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.create(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },
  aggregateToPersistence(address: AddressAggregate) {
    return {
      _id: address.id.value,
      ownerId: address.ownerId.value,
      defaultDate: address.defaultDate ? address.defaultDate.value : null,
      streetAddress: address.streetAddress.value,
      city: address.city.value,
      state: address.state.value,
      postalCode: address.postalCode.value,
      country: address.country.value,
      fullAddress: address.fullAddress.value,
      deleted: {
        deleted: address.delete.deleted,
        deletedFrom: address.delete.from?.value ?? null,
        deletedBy: address.delete.performedBy?.value ?? null,
        reason: address.delete.reason?.value ?? null,
      },
      createdAt: address.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },
  aggregateToReadModel(address: AddressAggregate): AddressReadModel {
    return {
      id: address.id.value,
      ownerId: address.ownerId.value,
      defaultDate: address.defaultDate ? address.defaultDate.value : null,
      streetAddress: address.streetAddress.value,
      city: address.city.value,
      state: address.state.value,
      postalCode: address.postalCode.value,
      country: address.country.value,
      fullAddress: address.fullAddress.value,
      deleted: {
        deleted: address.delete.deleted,
        deletedFrom: address.delete.from?.value ?? null,
        deletedBy: address.delete.performedBy?.value ?? null,
        reason: address.delete.reason?.value ?? null,
      },
      createdAt: address.createdAt.value,
    };
  },
  aggregateToResponseReadModel(address: AddressAggregate): AddressResponseReadModel {
    return {
      id: address.id.value,
      ownerId: address.ownerId.value,
      defaultDate: address.defaultDate ? address.defaultDate.value : null,
      streetAddress: address.streetAddress.value,
      city: address.city.value,
      state: address.state.value,
      postalCode: address.postalCode.value,
      country: address.country.value,
      fullAddress: address.fullAddress.value,
      createdAt: address.createdAt.value,
    };
  },
};
