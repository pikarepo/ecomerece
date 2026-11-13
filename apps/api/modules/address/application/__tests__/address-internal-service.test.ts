import { describe, expect, it } from 'bun:test';
import { AddressAggregate } from '@ecomerece/domain/modules/address/address.aggregate';
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
import { AddressInternalService } from '../address.app.internal.service';

const id = (n: number) =>
  Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);

function buildAddress(ownerId: Id, deleted = false) {
  return AddressAggregate.rehydrate(
    id(1),
    ownerId,
    null,
    AddressVO.create(
      StreetAddressVO.create('123 Main Street'),
      CityVO.create('Springfield'),
      StateVO.create('Illinois'),
      PostalCodeVO.create('62701'),
      CountryVO.create('USA'),
    ),
    deleted ? DeleteInfoVO.create(ownerId, Reason.create('No longer needed')) : DeleteInfoVO.none(),
    Quantity.none(),
    EffectiveDate.today(),
  );
}

function buildService(address: AddressAggregate | null) {
  const repo = {
    FindById: async () => address,
  };
  return new AddressInternalService(repo as never);
}

describe('AddressInternalService.ensureActiveAddressGetById', () => {
  it('returns the address as active when it belongs to the user', async () => {
    const ownerId = id(2);
    const result = await buildService(buildAddress(ownerId)).ensureActiveAddressGetById(
      id(1),
      ownerId,
    );

    expect(result.active).toBe(true);
    expect(result.address?.id).toBe(id(1).value);
  });

  it('does not expose an address owned by another user', async () => {
    const result = await buildService(buildAddress(id(2))).ensureActiveAddressGetById(
      id(1),
      id(3),
    );

    expect(result).toEqual({ address: null, active: false });
  });

  it('returns a deleted address as inactive', async () => {
    const ownerId = id(2);
    const result = await buildService(buildAddress(ownerId, true)).ensureActiveAddressGetById(
      id(1),
      ownerId,
    );

    expect(result.active).toBe(false);
    expect(result.address).not.toBeNull();
  });

  it('returns null when the address does not exist', async () => {
    const result = await buildService(null).ensureActiveAddressGetById(id(1), id(2));

    expect(result).toEqual({ address: null, active: false });
  });
});
