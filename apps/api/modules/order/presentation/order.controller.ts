import {
  buyNowOrderDto,
  createMyOrderDto,
  getAdminPaginatedOrdersQuerySchema,
  getMyOrdersQuerySchema,
  getVendorPaginatedOrdersQuerySchema,
  orderReasonDto,
  updateOrderDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { OrderApplicationService } from '../application/order.app.service';

export class OrderController extends BaseController<OrderApplicationService> {
  createMyOrder = async (c: Context) => {
    const data = await this.body(c, createMyOrderDto);

    const actor = c.get('user');
    return this.ok(c, await this.service.createMyOrder(data, actor));
  };

  buyNow = async (c: Context) => {
    const data = await this.body(c, buyNowOrderDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.buyNow(data, actor));
  };

  getMyOrders = async (c: Context) => {
    const query = this.query(c, getMyOrdersQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getMyOrders(query, actor._id));
  };

  getAdminPaginatedOrders = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedOrdersQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedOrders(query));
  };

  getMyOrderById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getMyOrderById(id, actor));
  };

  getAdminOrderById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getAdminOrderById(id));
  };

  cancelMyOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, orderReasonDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.cancelMyOrder(id, data, actor));
  };

  cancelAdminOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, orderReasonDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.cancelAdminOrder(id, data, actor));
  };

  getVendorPaginatedOrders = async (c: Context) => {
    const query = this.query(c, getVendorPaginatedOrdersQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findVendorPaginatedOrders(query, actor));
  };

  getVendorOrderById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getVendorOrderById(id, actor));
  };

  confirmOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.confirmOrder(id, actor));
  };

  completeOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.completeOrder(id, actor));
  };

  returnOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, orderReasonDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.returnOrder(id, data, actor));
  };

  refundOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, orderReasonDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.refundOrder(id, data, actor));
  };

  updateOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, updateOrderDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateOrder(id, data, actor));
  };

  deleteOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, orderReasonDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.deleteOrder(id, data, actor));
  };

  retryMyOrderItems = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.retryMyOrderItems(id, actor));
  };

  retryMyOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.retryMyOrderItem(id, actor));
  };

  recoverOrder = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.recoverOrder(id, actor));
  };
}
