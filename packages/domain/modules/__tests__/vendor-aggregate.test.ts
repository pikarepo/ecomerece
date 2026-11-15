import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import {
  AddressVO,
  CityVO,
  CountryVO,
  Description,
  EmailVO,
  Id,
  PhoneNumber,
  PostalCodeVO,
  Reason,
  Slug,
  StateVO,
  StreetAddressVO,
  Title,
  UrlVO,
} from '../../value-objects';
import { VendorAggregate } from '../vendor/vendor.aggregate';
import { ContactInfoVO } from '../vendor/value-objects/contact-info.vo';
import { ImageInfoVO } from '../vendor/value-objects/image-info.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const url = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);

function address() {
  return AddressVO.create(
    StreetAddressVO.create('12 Main Street'),
    CityVO.create('Springfield'),
    StateVO.create('Illinois'),
    PostalCodeVO.create('62701'),
    CountryVO.create('USA'),
  );
}

function contacts() {
  return ContactInfoVO.create(
    PhoneNumber.create('+123456789'),
    EmailVO.create('vendor@example.com'),
    address(),
  );
}

function vendor() {
  return VendorAggregate.create({
    id: id(100),
    ownerId: id(4),
    tittle: Title.create('Vendor Shop'),
    description: Description.create('A vendor description.'),
    contacts: contacts(),
    image: ImageInfoVO.create(url('logo'), url('banner')),
    slug: Slug.create('vendor-shop'),
  });
}

function deletedVendor() {
  const aggregate = vendor();
  aggregate.deleteVendor(id(9), reason());
  aggregate.clearEvents();
  return aggregate;
}

describe('VendorAggregate creation', () => {
  it('starts unverified, undeleted and stats refresh enabled', () => {
    const aggregate = vendor();

    expect(aggregate.verification.isPending).toBe(true);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.statsRefreshEnabled).toBe(true);
    expect(aggregate.title.value).toBe('Vendor Shop');
    expect(aggregate.slug.value).toBe('vendor-shop');
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('raises the created event through raiseCreated with the passed values', () => {
    const aggregate = vendor();

    aggregate.raiseCreated(id(101), id(4), Title.create('Other Shop'), Slug.create('other-shop'));

    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('vendor.created');
    expect(event?.payload).toMatchObject({
      vendorId: id(101),
      ownerId: id(4),
      title: Title.create('Other Shop'),
      slug: Slug.create('other-shop'),
    });
  });
});

describe('VendorAggregate verification', () => {
  it('verifies a pending vendor with an admin actor', () => {
    const aggregate = vendor();
    aggregate.clearEvents();

    aggregate.verifyVendor(id(9));

    expect(aggregate.verification.isVerified).toBe(true);
    expect(aggregate.verification.verifiedAt).not.toBeNull();
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['vendor.verified']);
  });

  it('refuses self-verification and a second verification', () => {
    const aggregate = vendor();
    expect(() => aggregate.verifyVendor(Id.create(id(4).value))).toThrow(
      'You cannot verify your own vendor.',
    );

    aggregate.verifyVendor(id(9));
    expect(() => aggregate.verifyVendor(id(9))).toThrow('User is already verified.');
  });

  it('rejects a verification once with a reason', () => {
    const aggregate = vendor();
    aggregate.clearEvents();

    aggregate.rejectVerification(id(9), reason());

    expect(aggregate.verification.isRejected).toBe(true);
    expect(aggregate.verification.rejectedReason).toEqual(reason());
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['vendor.rejected']);
    expect(() => aggregate.rejectVerification(id(9), reason())).toThrow(BadRequestError);
  });

  it('refuses self-rejection', () => {
    expect(() => vendor().rejectVerification(id(4), reason())).toThrow(BadRequestError);
  });
});

describe('VendorAggregate profile updates', () => {
  it('updates the image, contact and metadata with events', () => {
    const aggregate = vendor();
    aggregate.clearEvents();

    aggregate.updateImage(url('new-logo'), url('new-banner'), 'logo-key', 'banner-key');
    aggregate.updateContact(
      PhoneNumber.create('+987654321'),
      EmailVO.create('new@example.com'),
      address(),
    );
    aggregate.updatedMeta(
      Title.create('New Shop'),
      Slug.create('new-shop'),
      Description.create('A new description.'),
    );

    expect(aggregate.image.logo.value).toBe(url('new-logo').value);
    expect(aggregate.image.bannerKey).toBe('banner-key');
    expect(aggregate.contact.email.value).toBe('new@example.com');
    expect(aggregate.slug.value).toBe('new-shop');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'vendor.image-updated',
      'vendor.contact-updated',
      'vendor.meta-updated',
    ]);
  });

  it('refuses profile changes on a deleted vendor', () => {
    const aggregate = deletedVendor();

    expect(() => aggregate.verifyVendor(id(9))).toThrow(BadRequestError);
    expect(() => aggregate.updateImage(url('l'), url('b'))).toThrow(BadRequestError);
    expect(() => aggregate.updateContact(contacts().phone, contacts().email, address())).toThrow(
      BadRequestError,
    );
    expect(() =>
      aggregate.updatedMeta(
        Title.create('New Shop'),
        Slug.create('new-shop'),
        Description.create('A new description.'),
      ),
    ).toThrow(BadRequestError);
  });
});

describe('VendorAggregate soft delete and recovery', () => {
  it('deletes once and records the audit data', () => {
    const aggregate = vendor();

    aggregate.deleteVendor(id(9), reason());

    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.delete.performedBy).toEqual(id(9));
    expect(() => aggregate.deleteVendor(id(9), reason())).toThrow(BadRequestError);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('vendor.deleted');
  });

  it('recovers a deleted vendor for a non-owner', () => {
    const aggregate = deletedVendor();

    aggregate.recoverVendor(id(9));

    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['vendor.recovered']);
  });

  it('refuses recovery of an active vendor or by the owner', () => {
    expect(() => vendor().recoverVendor(id(9))).toThrow('This vendor is not deleted.');

    const aggregate = deletedVendor();
    expect(() => aggregate.recoverVendor(Id.create(id(4).value))).toThrow(
      'You cannot recover your own vendor.',
    );
  });
});

describe('VendorAggregate stats refresh toggle', () => {
  it('flips the flag and raises an event with the new value', () => {
    const aggregate = vendor();
    aggregate.clearEvents();

    aggregate.setStatsRefreshEnabled(false);

    expect(aggregate.statsRefreshEnabled).toBe(false);
    expect(aggregate.pullEvents().at(-1)?.payload).toMatchObject({ enabled: false });
  });

  it('refuses toggling a deleted vendor', () => {
    expect(() => deletedVendor().setStatsRefreshEnabled(true)).toThrow(BadRequestError);
  });
});
