import type { IUserQueries } from '@ecomerece/contracts';
import type { IVendorRepository, VendorReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { VendorMapper } from '../infrastructure/vendor.mapper';

export class VendorInternalService extends BaseService {
  constructor(
    private readonly vendorRepo: IVendorRepository,
    private readonly userQueries: IUserQueries,
  ) {
    super();
  }
  async canCreateVendor(id: Id) {
    const userActive = await this.userQueries.ensureActive(id);
    if (!userActive) throw new BadRequestError('User is not active.');
    const vendor = await this.vendorRepo.FindByOwnerId(id);
    if (vendor) throw new BadRequestError('Each user can create only one vendor.');
  }

  async getVendorByUserId(id: Id): Promise<VendorReadModel | null> {
    const vendor = await this.vendorRepo.FindByOwnerId(id);
    if (!vendor) return null;
    return VendorMapper.aggregateToReadModel(vendor);
  }

  async ensureActiveVendor(userId: Id, vendorId: Id): Promise<VendorReadModel> {
    const userActive = await this.userQueries.ensureActive(userId);
    if (!userActive) throw new BadRequestError('User is not active.');
    const vendor = await this.vendorRepo.FindByIdOrThrow(vendorId);
    if (vendor.ownerId !== userId) throw new BadRequestError('You do not own this vendor.');
    if (vendor.delete.isDeleted) throw new BadRequestError('This vendor has been removed.');
    if (!vendor.verification.isVerified)
      throw new BadRequestError('This vendor has not been verified yet.');
    return VendorMapper.aggregateToReadModel(vendor);
  }

  async ensureActiveVendorGetById(
    vendorId: Id,
  ): Promise<{ vendor: VendorReadModel | null; active: boolean }> {
    const vendor = await this.vendorRepo.FindById(vendorId);

    if (!vendor) return { vendor: null, active: false };

    if (
      vendor.delete.isDeleted ||
      !vendor.verification.isVerified ||
      vendor.verification.isRejected
    )
      return { vendor: VendorMapper.aggregateToReadModel(vendor), active: false };
    return { vendor: VendorMapper.aggregateToReadModel(vendor), active: true };
  }

  async verifyVendorAndGet(ids: Id[]): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    nonVerifiedIds: Id[];
    vendorReadModel: VendorReadModel[];
  }> {
    const vendors = await this.vendorRepo.FindByIds(ids);
    const validVendors = vendors.filter((v) => !v.delete.isDeleted && v.verification.isVerified);
    const validIdValues = new Set(validVendors.map((v) => v.id.value));
    const existingVendorIds = new Set(vendors.map((v) => v.id.value));
    const foundIds = ids.filter((id) => existingVendorIds.has(id.value));
    const notFoundIds = ids.filter((id) => !existingVendorIds.has(id.value));
    const deletedIds = vendors.filter((v) => v.delete.isDeleted).map((v) => v.id);
    const nonVerifiedIds = vendors.filter((v) => !v.verification.isVerified).map((v) => v.id);
    const validIds = foundIds.filter((id) => validIdValues.has(id.value));
    const vendorReadModel = validVendors.map((v) => VendorMapper.aggregateToReadModel(v));
    return { validIds, notFoundIds, deletedIds, nonVerifiedIds, vendorReadModel };
  }
}
