import {
  blockLiftProductDto,
  blockProductDto,
  CreateMyProductDtoSchema,
  clearIngredientsDto,
  deafultImageDto,
  disclaimerItemsDto,
  getAdminPaginatedProductsQuerySchema,
  getMyPaginatedProductsQuerySchema,
  getPaginatedProductsQuerySchema,
  imagesDto,
  ingredientsDto,
  productAppereanceDto,
  productStockDto,
  recoverProductDto,
  softDeleteMyProductDto,
  toggleDiscalimerDto,
  toggleIngredientsDto,
  updateDisclaimerDto,
  updateProductMetaDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { ProductApplicationService } from '../application/product.app.service';

export class ProductController extends BaseController<ProductApplicationService> {
  getPaginatedProducts = async (c: Context) => {
    const query = this.query(c, getPaginatedProductsQuerySchema);
    const result = await this.service.findPublicPaginatedProducts(query);
    return this.ok(c, result);
  };

  getAdminPaginatedProducts = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedProductsQuerySchema);
    const result = await this.service.findAdminPaginatedProducts(query);
    return this.ok(c, result);
  };

  getProductById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getProductById(id));
  };

  createMyProudct = async (c: Context) => {
    const data = await this.body(c, CreateMyProductDtoSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.createMyProduct(data, actor));
  };

  softDeleteMyProduct = async (c: Context) => {
    const data = await this.body(c, softDeleteMyProductDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.softDeleteMyProduct(data, actor));
  };

  recoverMyProduct = async (c: Context) => {
    const data = await this.body(c, recoverProductDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.recoverMyProduct(data, actor));
  };

  blockProduct = async (c: Context) => {
    const data = await this.body(c, blockProductDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.blockProduct(data, actor));
  };

  unBlockProduct = async (c: Context) => {
    const data = await this.body(c, blockLiftProductDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.unBlockProduct(data, actor));
  };

  makeMyProductPublic = async (c: Context) => {
    const data = await this.body(c, productAppereanceDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.makeMyProductPublic(data, actor));
  };

  makeMyProductPrivate = async (c: Context) => {
    const data = await this.body(c, productAppereanceDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.makeMyProductPrivate(data, actor));
  };

  updateMyProductMeta = async (c: Context) => {
    const data = await this.body(c, updateProductMetaDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateMyProductMeta(data, actor));
  };

  toggleMyProductDisclaimer = async (c: Context) => {
    const data = await this.body(c, toggleDiscalimerDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.toggleMyProductDisclaimer(data, actor));
  };

  addMyProductDisclaimers = async (c: Context) => {
    const data = await this.body(c, disclaimerItemsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.addMyProductDisclaimers(data, actor));
  };

  removeMyProductDisclaimers = async (c: Context) => {
    const data = await this.body(c, disclaimerItemsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.removeMyProductDisclaimers(data, actor));
  };

  addMyProductImages = async (c: Context) => {
    const data = await this.body(c, imagesDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.addMyProductImages(data, actor));
  };

  removeMyProductImages = async (c: Context) => {
    const data = await this.body(c, imagesDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.removeMyProductImages(data, actor));
  };

  setMyProductDefaultImage = async (c: Context) => {
    const data = await this.body(c, deafultImageDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.setMyProductDefaultImage(data, actor));
  };

  toggleMyProductIngredients = async (c: Context) => {
    const data = await this.body(c, toggleIngredientsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.toggleMyProductIngredients(data, actor));
  };

  addMyProductIngredients = async (c: Context) => {
    const data = await this.body(c, ingredientsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.addMyProductIngredients(data, actor));
  };

  removeMyProductIngredients = async (c: Context) => {
    const data = await this.body(c, ingredientsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.removeMyProductIngredients(data, actor));
  };

  updateMyProductDisclaimer = async (c: Context) => {
    const data = await this.body(c, updateDisclaimerDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateMyProductDisclaimer(data, actor));
  };

  clearMyProductIngredients = async (c: Context) => {
    const data = await this.body(c, clearIngredientsDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.clearMyProductIngredients(data, actor));
  };

  setMyProductInStock = async (c: Context) => {
    const data = await this.body(c, productStockDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.setMyProductInStock(data, actor));
  };

  getMyPaginatedProducts = async (c: Context) => {
    const query = this.query(c, getMyPaginatedProductsQuerySchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.findMyPaginatedProducts(query, actor));
  };
}
