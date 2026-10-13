import {
  createFeatureDtoSchema,
  createHomeCategoryDtoSchema,
  createProductContainerDtoSchema,
  createPromoDtoSchema,
  createSlideDtoSchema,
  deleteFeatureDtoSchema,
  deleteHomeCategoryDtoSchema,
  deleteProductContainerDtoSchema,
  deletePromoDtoSchema,
  deleteSlideDtoSchema,
  reorderHomeCategoriesDtoSchema,
  reorderProductContainersDtoSchema,
  reorderSlidesDtoSchema,
  setFeaturesDtoSchema,
  updateFeatureDtoSchema,
  updateHomeCategoryDtoSchema,
  updateProductContainerDtoSchema,
  updatePromoDtoSchema,
  updateSlideDtoSchema,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { HomeAppService } from '../application/home.app.service';

export class HomeController extends BaseController<HomeAppService> {
  // --- Public Storefront Layout ---
  getHome = async (c: Context) => {
    return this.ok(c, await this.service.getHome());
  };

  // --- Categories ---
  addCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createHomeCategoryDtoSchema);
    return this.ok(c, await this.service.addCategory(data, actor?._id ?? 'admin'));
  };
  updateCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateHomeCategoryDtoSchema);
    return this.ok(c, await this.service.updateCategory(data, actor?._id ?? 'admin'));
  };
  removeCategory = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteHomeCategoryDtoSchema);
    return this.ok(c, await this.service.removeCategory(data, actor?._id ?? 'admin'));
  };
  reorderCategories = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, reorderHomeCategoriesDtoSchema);
    return this.ok(c, await this.service.reorderCategories(data, actor?._id ?? 'admin'));
  };

  // --- Slides ---
  addSlide = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createSlideDtoSchema);
    return this.ok(c, await this.service.addSlide(data, actor?._id ?? 'admin'));
  };
  updateSlide = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateSlideDtoSchema);
    return this.ok(c, await this.service.updateSlide(data, actor?._id ?? 'admin'));
  };
  removeSlide = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteSlideDtoSchema);
    return this.ok(c, await this.service.removeSlide(data, actor?._id ?? 'admin'));
  };
  reorderSlides = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, reorderSlidesDtoSchema);
    return this.ok(c, await this.service.reorderSlides(data, actor?._id ?? 'admin'));
  };

  // --- Promos ---
  addPromo = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createPromoDtoSchema);
    return this.ok(c, await this.service.addPromo(data, actor?._id ?? 'admin'));
  };
  updatePromo = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updatePromoDtoSchema);
    return this.ok(c, await this.service.updatePromo(data, actor?._id ?? 'admin'));
  };
  removePromo = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deletePromoDtoSchema);
    return this.ok(c, await this.service.removePromo(data, actor?._id ?? 'admin'));
  };

  // --- Features ---
  addFeature = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createFeatureDtoSchema);
    return this.ok(c, await this.service.addFeature(data, actor?._id ?? 'admin'));
  };
  updateFeature = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateFeatureDtoSchema);
    return this.ok(c, await this.service.updateFeature(data, actor?._id ?? 'admin'));
  };
  removeFeature = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteFeatureDtoSchema);
    return this.ok(c, await this.service.removeFeature(data, actor?._id ?? 'admin'));
  };
  setFeatures = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, setFeaturesDtoSchema);
    return this.ok(c, await this.service.setFeatures(data, actor?._id ?? 'admin'));
  };

  // --- Product Containers ---
  addContainer = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createProductContainerDtoSchema);
    return this.ok(c, await this.service.addProductContainer(data, actor?._id ?? 'admin'));
  };
  updateContainer = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateProductContainerDtoSchema);
    return this.ok(c, await this.service.updateProductContainer(data, actor?._id ?? 'admin'));
  };
  removeContainer = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteProductContainerDtoSchema);
    return this.ok(c, await this.service.removeProductContainer(data, actor?._id ?? 'admin'));
  };
  reorderContainers = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, reorderProductContainersDtoSchema);
    return this.ok(c, await this.service.reorderContainers(data, actor?._id ?? 'admin'));
  };
}
