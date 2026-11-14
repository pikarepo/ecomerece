import { addCartItemDto, checkoutCartDto, deleteCartDto } from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { CartApplicationService } from '../application/cart.app.service';

export class CartController extends BaseController<CartApplicationService> {
  getMyCart = async (c: Context) => {
    const actor = c.get('user');
    return this.ok(c, await this.service.getMyCart(actor));
  };

  initMyCart = async (c: Context) => {
    const actor = c.get('user');
    return this.ok(c, await this.service.initMyCart(actor));
  };

  addItem = async (c: Context) => {
    const data = await this.body(c, addCartItemDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.addItem(data, actor));
  };

  checkoutItems = async (c: Context) => {
    const data = await this.body(c, checkoutCartDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.checkoutItems(data, actor));
  };

  deleteCart = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, deleteCartDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.deleteCart(id, data, actor));
  };
}
