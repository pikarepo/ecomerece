import {
  cancelMyOrderItemsDto,
  deleteOrderItemDto,
  getAdminPaginatedOrderItemsQuerySchema,
  getVendorPaginatedOrderItemsQuerySchema,
  idSchema,
  updateOrderItemDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { OrderItemsApplicationService } from '../application/order-item.app.service';

export class OrderItemsController extends BaseController<OrderItemsApplicationService> {
  getOrderItemById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getOrderItemById(id));
  };

  getMyOrderItemsByOrderId = async (c: Context) => {
    const orderId = this.param(c, 'orderId', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getMyOrderItemsByOrderId(orderId, actor));
  };

  getAdminPaginatedOrderItems = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedOrderItemsQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedOrderItems(query));
  };

  getVendorPaginatedOrderItems = async (c: Context) => {
    const query = this.query(c, getVendorPaginatedOrderItemsQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findVendorPaginatedOrderItems(query, actor));
  };

  getVendorOrderItemById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getVendorOrderItemById(id, actor));
  };

  updateVendorOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, updateOrderItemDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateVendorOrderItem(id, data, actor));
  };

  deleteOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, deleteOrderItemDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.deleteOrderItem(id, data, actor));
  };

  recoverOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.recoverOrderItem(id, actor));
  };

  cancelMyOrderItems = async (c: Context) => {
    const data = await this.body(c, cancelMyOrderItemsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.cancelMyOrderItems(data, actor));
  };

  updateOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, updateOrderItemDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateOrderItem(id, data, actor));
  };

  confirmOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.confirmOrderItem(id, actor));
  };

  completeOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.completeOrderItem(id, actor));
  };

  returnOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.returnOrderItem(id, actor));
  };

  refundOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.refundOrderItem(id, actor));
  };

  vendorConfirmOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.vendorConfirmOrderItem(id, actor));
  };

  vendorCompleteOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.vendorCompleteOrderItem(id, actor));
  };

  vendorReturnOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.vendorReturnOrderItem(id, actor));
  };

  vendorRefundOrderItem = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.vendorRefundOrderItem(id, actor));
  };
}
