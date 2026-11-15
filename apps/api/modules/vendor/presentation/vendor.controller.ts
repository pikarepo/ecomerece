import { Id } from '@ecomerece/domain/value-objects/id.vo';
import {
  CreateVendorDtoSchema,
  DeleteMyVendorDtoSchema,
  DeleteVendorDtoSchema,
  getAdminPaginatedVendorsQuerySchema,
  getPaginatedVendorsQuerySchema,
  RecoverVendorDtoSchema,
  RejectVendorDtoSchema,
  UpdateMyVendorContactDtoSchema,
  UpdateMyVendorImageDtoSchema,
  UpdateMyVendorMetaDtoSchema,
  updateVendorStatsRefreshSchema,
  VendorParamDtoSchema,
  VerifyVendorDtoSchema,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { VendorAppService } from '../application/vendor.app.service';

export class VendorController extends BaseController<VendorAppService> {
  /** Public storefront profile. */
  getPublicVendorById = async (c: Context) => {
    const vendorId = this.param(c, 'id', VendorParamDtoSchema);
    return this.ok(c, await this.service.getPublicVendorById(vendorId));
  };

  /** Admin record, including contact details and stats. */
  getAdminVendorById = async (c: Context) => {
    const vendorId = this.param(c, 'id', VendorParamDtoSchema);
    return this.ok(c, await this.service.getVendorById(vendorId));
  };

  getMyVendor = async (c: Context) => {
    const actor = c.get('user') as { _id: string };
    const vendor = await this.service.getMyVendor(Id.create(actor._id));
    if (!vendor) return this.notFound(c, 'No vendor found for this account');
    return this.ok(c, vendor);
  };

  getPaginatedVendors = async (c: Context) => {
    const query = this.query(c, getPaginatedVendorsQuerySchema);
    return this.ok(c, await this.service.findPaginatedVendors(query));
  };

  getAdminPaginatedVendors = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedVendorsQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedVendors(query));
  };

  createMyVendor = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, CreateVendorDtoSchema);
    return this.ok(c, await this.service.createMyVendor(data, actor));
  };

  deleteMyVendor = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, DeleteMyVendorDtoSchema);
    return this.ok(c, await this.service.deleteMyVendor(data, actor));
  };

  updateMyVendorMeta = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, UpdateMyVendorMetaDtoSchema);
    return this.ok(c, await this.service.updateMyVendorMeta(data, actor));
  };

  updateMyVendorContact = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, UpdateMyVendorContactDtoSchema);
    return this.ok(c, await this.service.updateMyVendorContact(data, actor));
  };

  updateMyVendorImage = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, UpdateMyVendorImageDtoSchema);
    return this.ok(c, await this.service.updateMyVendorImage(data, actor));
  };

  softDeleteVendor = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, DeleteVendorDtoSchema);
    return this.ok(c, await this.service.softDeleteVendor(data, actor));
  };

  recoverVendor = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, RecoverVendorDtoSchema);
    return this.ok(c, await this.service.recoverVendor(data, actor));
  };

  verifyVendor = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, VerifyVendorDtoSchema);
    return this.ok(c, await this.service.verifyVendor(data, actor));
  };

  rejectVendorVerification = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, RejectVendorDtoSchema);
    return this.ok(c, await this.service.rejectVendorVerification(data, actor));
  };

  updateMyStatsRefresh = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateVendorStatsRefreshSchema);
    return this.ok(c, await this.service.updateMyStatsRefresh(actor, data.enabled));
  };
}
