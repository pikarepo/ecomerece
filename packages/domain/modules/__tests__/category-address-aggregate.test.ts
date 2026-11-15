import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import {
  AddressVO,
  CityVO,
  CountryVO,
  Id,
  ImageKey,
  PostalCodeVO,
  Reason,
  StateVO,
  StreetAddressVO,
  Title,
  UrlVO,
} from '../../value-objects';
import { AddressAggregate } from '../address/address.aggregate';
import { CategoryAggregate } from '../category/category.aggregate';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const url = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);

function category() {
  return CategoryAggregate.create({
    id: id(200),
    title: Title.create('Category title'),
    image: url('category'),
    createdBy: id(9),
  });
}

function deletedCategory() {
  const aggregate = category();
  aggregate.deleteCategory(reason(), id(9));
  aggregate.clearEvents();
  return aggregate;
}

describe('CategoryAggregate lifecycle', () => {
  it('starts active, unblocked and raises category.created', () => {
    const aggregate = category();

    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.block.isBlocked).toBe(false);
    expect(aggregate.imageKey).toBeUndefined();
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['category.created']);
  });

  it('updates metadata and image with their events', () => {
    const aggregate = category();
    aggregate.clearEvents();

    aggregate.updateMeta(Title.create('New category title'), id(9));
    aggregate.updateImage(url('new-category'), ImageKey.create('categories', 'new.png'));

    expect(aggregate.title.value).toBe('New category title');
    expect(aggregate.image.value).toBe(url('new-category').value);
    expect(aggregate.imageKey?.value).toBe('categories/new.png');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'category.meta-updated',
      'category.image-updated',
    ]);
  });

  it('blocks and unblocks exactly once per state', () => {
    const aggregate = category();

    aggregate.blockCategory(reason(), id(9));
    expect(aggregate.block.isBlocked).toBe(true);
    expect(() => aggregate.blockCategory(reason(), id(9))).toThrow('Category is already blocked.');

    aggregate.unblockCategory(id(9));
    expect(aggregate.block.isBlocked).toBe(false);
    expect(() => aggregate.unblockCategory(id(9))).toThrow('Category is not blocked.');
  });

  it('deletes once and recovers once', () => {
    const aggregate = category();

    aggregate.deleteCategory(reason(), id(9));
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(() => aggregate.deleteCategory(reason(), id(9))).toThrow(BadRequestError);

    aggregate.recoverCategory(id(9));
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(() => aggregate.recoverCategory(id(9))).toThrow(BadRequestError);
  });

  it('blocks metadata, image and blocking changes while deleted', () => {
    const aggregate = deletedCategory();

    expect(() => aggregate.updateMeta(Title.create('New title'), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.updateImage(url('new-image'))).toThrow(BadRequestError);
    expect(() => aggregate.blockCategory(reason(), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.unblockCategory(id(9))).toThrow(BadRequestError);
  });
});

describe('AddressAggregate lifecycle', () => {
  function address(ownerId = id(7)) {
    return AddressAggregate.create({
      _id: id(500),
      _ownerId: ownerId,
      _streetAddress: StreetAddressVO.create('12 Main Street'),
      _city: CityVO.create('Springfield'),
      _state: StateVO.create('Illinois'),
      _postalCode: PostalCodeVO.create('62701'),
      _country: CountryVO.create('USA'),
    });
  }

  function updatedAddress() {
    return AddressVO.create(
      StreetAddressVO.create('99 New Avenue'),
      CityVO.create('Shelbyville'),
      StateVO.create('Illinois'),
      PostalCodeVO.create('62702'),
      CountryVO.create('USA'),
    );
  }

  it('starts without a default date and raises address.created', () => {
    const aggregate = address();

    expect(aggregate.defaultDate).toBeNull();
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.fullAddress.value).toBe('12 Main Street, Springfield, Illinois, 62701, USA');
    expect(aggregate.toString()).toBe(aggregate.fullAddress.value);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['address.created']);
  });

  it('updates only for the owner and raises address.updated', () => {
    const aggregate = address();
    aggregate.clearEvents();

    aggregate.updateAddress(updatedAddress(), id(7));

    expect(aggregate.streetAddress.value).toBe('99 New Avenue');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['address.updated']);
    expect(() => aggregate.updateAddress(updatedAddress(), id(8))).toThrow(
      'You can only update your own address.',
    );
  });

  it('sets the address as default exactly once', () => {
    const aggregate = address();

    aggregate.setAsDefault(id(7));
    expect(aggregate.defaultDate).not.toBeNull();
    expect(() => aggregate.setAsDefault(id(7))).toThrow(
      'This address is already the default address.',
    );
    expect(() => aggregate.setAsDefault(id(8))).toThrow(
      'You can only set your own address as default.',
    );
  });

  it('deletes and recovers only for the owner', () => {
    const aggregate = address();

    expect(() => aggregate.deleteAddress(reason(), id(8))).toThrow(
      'You can only delete your own address.',
    );
    aggregate.deleteAddress(reason(), id(7));
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(() => aggregate.deleteAddress(reason(), id(7))).toThrow(
      'This address has already been removed.',
    );

    expect(() => aggregate.recoverAddress(id(8))).toThrow('You can only recover your own address.');
    aggregate.recoverAddress(id(7));
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(() => aggregate.recoverAddress(id(7))).toThrow(
      'This address has already been recovered.',
    );
  });

  it('blocks updates and default changes while deleted', () => {
    const aggregate = address();
    aggregate.deleteAddress(reason(), id(7));

    expect(() => aggregate.updateAddress(updatedAddress(), id(7))).toThrow(BadRequestError);
    expect(() => aggregate.setAsDefault(id(7))).toThrow(BadRequestError);
  });

  it('compares ownership by value', () => {
    const aggregate = address();

    expect(() => aggregate.updateAddress(updatedAddress(), Id.create(id(7).value))).not.toThrow();
  });
});
