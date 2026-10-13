import {
  createCategoryDto,
  deleteCategoryDto,
  getAdminPaginatedCategoriesSchema,
  getPaginatedDto,
  idSchema,
  updateCategoryDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { CategoryAppService } from '../application/category.app.service';

export class CategoryController extends BaseController<CategoryAppService> {
  createCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createCategoryDto);
    return this.ok(c, await this.service.createCategory(data, actor));
  };
  updateCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateCategoryDto);
    return this.ok(c, await this.service.updateCategory(data, actor));
  };
  getPaginated = async (c: Context) => {
    const data = this.query(c, getPaginatedDto);
    return this.ok(c, await this.service.getPaginatedCategories(data));
  };
  getAdminPaginated = async (c: Context) => {
    const data = this.query(c, getAdminPaginatedCategoriesSchema);
    return this.ok(c, await this.service.getAdminPaginatedCategories(data));
  };
  deleteCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteCategoryDto);
    return this.ok(c, await this.service.deleteCategoryById(data, actor));
  };
  getCategory = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getCategoryById(id));
  };
}
