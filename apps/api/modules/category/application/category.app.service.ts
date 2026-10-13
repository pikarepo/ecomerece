import {
  CategoryAggregate,
  Id,
  type IImageStoragePort,
  type ImageKey,
  ImageSource,
  Quantity,
  Reason,
  Title,
  UrlVO,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type {
  createCategoryDtoType,
  deleteCategoryType,
  GetAdminPaginatedCategoriesDto,
  getPaginatedDtoType,
  updateCategoryType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import { BaseService } from '../../../core/services/base.services';
import type { UserPersistence } from '../../user/infrastructure/user.models';
import { CategoryMapper } from '../infrastructure/category.mapper';
import type { CategoryPersistence } from '../infrastructure/category.models';
import type { CategoryRepository } from '../infrastructure/category.repository';
import { type CategoryMessagesType, CategoryMessags } from '../presentation/category.messages';

type ResolvedImage = { url: UrlVO; imageKey?: ImageKey };

const CATEGORY_COLLATION = { locale: 'en', strength: 2 };

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class CategoryAppService extends BaseService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly eventBus: IEventBus,
    private readonly imageStorage: IImageStoragePort,
  ) {
    super();
  }

  private async publishEvents(category: CategoryAggregate): Promise<void> {
    const events = category.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  private async persist(category: CategoryAggregate, cleanupKey?: ImageKey): Promise<void> {
    try {
      await this.categoryRepo.Save(category);
    } catch (error) {
      await this.deleteImage(cleanupKey);
      throw error;
    }
    await this.publishEvents(category);
  }

  private isDataUri(value: string): boolean {
    return value.startsWith('data:image/');
  }

  private decodeDataUri(value: string): { contentType: string; bytes: Uint8Array } {
    const separator = value.indexOf(',');
    const header = value.slice(5, separator);
    return {
      contentType: header.split(';')[0],
      bytes: Buffer.from(value.slice(separator + 1), 'base64'),
    };
  }

  private async resolveImage(value: string, folder: string): Promise<ResolvedImage> {
    if (!this.isDataUri(value)) {
      return { url: UrlVO.create(value) };
    }
    const { contentType, bytes } = this.decodeDataUri(value);
    const stored = await this.imageStorage.upload(ImageSource.fromBytes(bytes, contentType), {
      folder,
      access: 'public',
    });
    return { url: UrlVO.create(stored.publicUrl), imageKey: stored.key };
  }

  private async deleteImage(key?: ImageKey): Promise<void> {
    if (!key) return;
    try {
      await this.imageStorage.delete(key);
    } catch (error) {
      console.error(
        `[category] failed to clean up stored image '${key.value}':`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  async createCategory(
    data: createCategoryDtoType,
    actor: UserPersistence,
  ): Promise<CategoryMessagesType> {
    const id = Id.create();
    const title = Title.create(data.title);
    const actorId = Id.create(actor._id);
    const image = await this.resolveImage(data.image, 'categories');
    const category = CategoryAggregate.create({
      title: title,
      id: id,
      image: image.url,
      createdBy: actorId,
      imageKey: image.imageKey,
    });
    try {
      await this.categoryRepo.Create(category);
    } catch (error) {
      await this.deleteImage(image.imageKey);
      throw error;
    }
    await this.publishEvents(category);
    return CategoryMessags.created(id, actorId);
  }

  async updateCategory(
    data: updateCategoryType,
    actor: UserPersistence,
  ): Promise<CategoryMessagesType> {
    const id = Id.create(data.id);
    const actorId = Id.create(actor._id);
    const category = await this.categoryRepo.FindByIdOrThrow(id);

    if (data.title) {
      category.updateMeta(Title.create(data.title), actorId);
    }

    if (data.image) {
      const previousImageKey = category.imageKey;
      const image = await this.resolveImage(data.image, 'categories');
      category.updateImage(image.url, image.imageKey);
      await this.persist(category, image.imageKey);
      if (previousImageKey && !image.imageKey?.equals(previousImageKey)) {
        await this.deleteImage(previousImageKey);
      }
      return CategoryMessags.updated(id, actorId);
    }

    await this.persist(category);
    return CategoryMessags.updated(id, actorId);
  }

  async deleteCategoryById(
    data: deleteCategoryType,
    actor: UserPersistence,
  ): Promise<CategoryMessagesType> {
    const id = Id.create(data.id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const category = await this.categoryRepo.FindByIdOrThrow(id);
    category.deleteCategory(reason, actorId);
    await this.persist(category);
    return CategoryMessags.deleted(id, actorId);
  }

  async getCategoryById(id: string) {
    const categoryId = Id.create(id);
    const category = await this.categoryRepo.FindByIdOrThrow(categoryId);
    return CategoryMapper.aggregateToReadModel(category);
  }

  async getPaginatedCategories(data: getPaginatedDtoType): Promise<{
    data: any;
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const filter: FilterQuery<CategoryPersistence> = {
      'deleted.deleted': false,
      'block.blocked': false,
    };
    if (data.search) {
      filter.title = { $regex: `^${escapeRegex(data.search)}` };
    }
    return this.categoryRepo.FindPaginated({
      filter,
      cursor: data.cursor ? Id.create(data.cursor) : undefined,
      limit: data.limit ? Quantity.create(data.limit) : undefined,
      direction: data.direction,
      collation: CATEGORY_COLLATION,
    });
  }

  async getAdminPaginatedCategories(data: GetAdminPaginatedCategoriesDto): Promise<{
    data: any;
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const filter: FilterQuery<CategoryPersistence> = {};
    if (data.search) {
      filter.title = { $regex: `^${escapeRegex(data.search)}` };
    }
    if (data.deleted !== undefined) filter['deleted.deleted'] = data.deleted;
    if (data.blocked !== undefined) filter['block.blocked'] = data.blocked;
    return this.categoryRepo.FindPaginated({
      filter,
      cursor: data.cursor ? Id.create(data.cursor) : undefined,
      limit: data.limit ? Quantity.create(data.limit) : undefined,
      direction: data.direction,
      collation: CATEGORY_COLLATION,
    });
  }
}
