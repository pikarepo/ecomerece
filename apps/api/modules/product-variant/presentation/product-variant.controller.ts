import {
  createMyProductVariantDto,
  getAdminPaginatedVariantsQuerySchema,
  softDeleteMyVariantDto,
  toggleVariantApperaaracneDto,
  upadteMyVariantMetaDto,
  updateMyVariatPriceDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { productVariantApplicationService } from '../application/product-variant.app.service';

export class ProductVariantController extends BaseController<productVariantApplicationService> {
  createMyProductVariant = async (c: Context) => {
    const data = await this.body(c, createMyProductVariantDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.createMyProductVariant(data, actor));
  };
  getVarientsByProductId = async (c: Context) => {
    const productId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getVarientsByProductId(productId));
  };
  updateMyVariantPrice = async (c: Context) => {
    const data = await this.body(c, updateMyVariatPriceDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateMyVariantPrice(data, actor));
  };
  updateMyVariantMeta = async (c: Context) => {
    const data = await this.body(c, upadteMyVariantMetaDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateMyVariantMeta(data, actor));
  };
  toggleMyVaraintAppereance = async (c: Context) => {
    const data = await this.body(c, toggleVariantApperaaracneDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.toggleMyVaraintAppereance(data, actor));
  };
  softDeleteMyVariant = async (c: Context) => {
    const data = await this.body(c, softDeleteMyVariantDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.softDeleteMyVariant(data, actor));
  };
  recoverVariant = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.recoverVariant(id, actor));
  };
  getAdminPaginatedVariants = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedVariantsQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedVariants(query));
  };
}
