import {
  createMyOrderDto,
  getAdminPaginatedOrdersQuerySchema,
  getMyOrdersQuerySchema,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { OrderApplicationService } from '../application/order.app.service';

export class OrderController extends BaseController<OrderApplicationService> {
  createMyOrder = async (c: Context) => {
    const data = await this.body(c, createMyOrderDto);

    const actor = c.get('user');
    return this.ok(c, await this.service.createMyOrder(data, actor));
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
}
