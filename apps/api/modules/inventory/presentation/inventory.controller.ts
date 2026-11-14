import {
  buyMyInventoryStockDto,
  createMyInventoryDto,
  deleteInventoryDto,
  getAdminPaginatedInventoryQuerySchema,
  getVendorPaginatedInventoryQuerySchema,
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
  getInventoryById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getInventoryById(id));
  };
  deleteMyInventory = async (c: Context) => {
    const data = await this.body(c, deleteInventoryDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.deleteMyInventory(data, inventoryId, actor));
  };
  getAdminPaginatedInventory = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedInventoryQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedInventory(query));
  };

  getAdminInventoryById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getInventoryById(id));
  };

  getVendorPaginatedInventory = async (c: Context) => {
    const query = this.query(c, getVendorPaginatedInventoryQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findVendorPaginatedInventory(query, actor));
  };

  getVendorInventoryById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.getVendorInventoryById(id, actor));
  };

  createInventory = async (c: Context) => {
    const data = await this.body(c, createMyInventoryDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.createInventory(data, actor));
  };

  buyAdminInventory = async (c: Context) => {
    const data = await this.body(c, buyMyInventoryStockDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.buyAdminInventoryStock(data, inventoryId, actor));
  };

  updateAdminLowStockThreshold = async (c: Context) => {
    const data = await this.body(c, updateMylowStockThresholdDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.updateAdminLowStockThreshold(data, inventoryId, actor));
  };

  removeAdminInventoryStock = async (c: Context) => {
    const data = await this.body(c, removeMyInventoryStockDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.removeAdminInventoryStock(data, inventoryId, actor));
  };

  deleteAdminInventory = async (c: Context) => {
    const data = await this.body(c, deleteInventoryDto);
    const actor = c.get('user');
    const inventoryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.deleteAdminInventory(data, inventoryId, actor));
  };
}
