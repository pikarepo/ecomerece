import {
  acceptOrderRequestDto,
  createOrderRequestDto,
  getAdminOrderRequestsQuerySchema,
  getMyOrderRequestsQuerySchema,
  getVendorOrderRequestsQuerySchema,
  rejectOrderRequestDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { OrderRequestApplicationService } from '../application/order-request.app.service';

export class OrderRequestController extends BaseController<OrderRequestApplicationService> {
  createMyOrderRequest = async (c: Context) => {
    const data = await this.body(c, createOrderRequestDto);
    const actor = c.get('user');
    return this.created(c, await this.service.createMyOrderRequest(data, actor));
  };

  getMyOrderRequests = async (c: Context) => {
    const query = this.query(c, getMyOrderRequestsQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findMyOrderRequests(query, actor));
  };

  getMyOrderRequestById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getMyOrderRequestById(id, actor));
  };

  cancelMyOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.cancelMyOrderRequest(id, actor));
  };

  getVendorOrderRequests = async (c: Context) => {
    const query = this.query(c, getVendorOrderRequestsQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findVendorOrderRequests(query, actor));
  };

  getVendorOrderRequestById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getVendorOrderRequestById(id, actor));
  };

  acceptVendorOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, acceptOrderRequestDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.acceptVendorOrderRequest(id, data, actor));
  };

  rejectVendorOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, rejectOrderRequestDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.rejectVendorOrderRequest(id, data, actor));
  };

  getAdminOrderRequests = async (c: Context) => {
    const query = this.query(c, getAdminOrderRequestsQuerySchema);
    return this.ok(c, await this.service.findAdminOrderRequests(query));
  };

  getAdminOrderRequestById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getAdminOrderRequestById(id));
  };

  acceptAdminOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, acceptOrderRequestDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.acceptAdminOrderRequest(id, data, actor));
  };

  rejectAdminOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, rejectOrderRequestDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.rejectAdminOrderRequest(id, data, actor));
  };

  cancelAdminOrderRequest = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.cancelAdminOrderRequest(id, actor));
  };
}
