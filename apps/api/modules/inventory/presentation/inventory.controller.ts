import {
  buyMyInventoryStockDto,
  createMyInventoryDto,
  getAdminPaginatedInventoryQuerySchema,
  removeMyInventoryStockDto,
  updateMylowStockThresholdDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { InventoryApplicationService } from '../application/inventory.app.service';

export class InventoryController extends BaseController<InventoryApplicationService> {
  createMyInventory = async (c: Context) => {
    const data = await this.body(c, createMyInventoryDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.createMyInventory(data, actor));
  };
  buyMyInventory = async (c: Context) => {
    const data = await this.body(c, buyMyInventoryStockDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.buyMyInventoryStock(data, inventoryId, actor));
  };
  updateMylowStockThreshold = async (c: Context) => {
    const data = await this.body(c, updateMylowStockThresholdDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.updateMylowStockThreshold(data, inventoryId, actor));
  };
  removeMyInventoryStock = async (c: Context) => {
    const data = await this.body(c, removeMyInventoryStockDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.removeMyInventoryStock(data, inventoryId, actor));
  };
  getInventoryByVarientId = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);

    return this.ok(c, await this.service.getInventoryByVarientId(id));
  };
  getAdminPaginatedInventory = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedInventoryQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedInventory(query));
  };
}
