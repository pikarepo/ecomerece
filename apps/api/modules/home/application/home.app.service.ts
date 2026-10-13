import {
  CategoryVO,
  ColorVO,
  Description,
  FeatureVO,
  type HomeAggregate,
  IconVO,
  Id,
  type IImageStoragePort,
  type ImageKey,
  ImageSource,
  ProductContainerVO,
  PromoVO,
  Quantity,
  SlideVO,
  Title,
  UrlVO,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { BaseQueryVO } from '@ecomerece/domain/value-objects/query.vo';
import type {
  CreateFeatureDtoType,
  CreateHomeCategoryDtoType,
  CreateProductContainerDtoType,
  CreatePromoDtoType,
  CreateSlideDtoType,
  DeleteFeatureDtoType,
  DeleteHomeCategoryDtoType,
  DeleteProductContainerDtoType,
  DeletePromoDtoType,
  DeleteSlideDtoType,
  HomeResponseReadModel,
  ReorderHomeCategoriesDtoType,
  ReorderProductContainersDtoType,
  ReorderSlidesDtoType,
  SetFeaturesDtoType,
  UpdateFeatureDtoType,
  UpdateHomeCategoryDtoType,
  UpdateProductContainerDtoType,
  UpdatePromoDtoType,
  UpdateSlideDtoType,
} from '@ecomerece/shared';
import { BaseService } from '../../../core/services/base.services';
import { NotFoundError } from '../../../errors/app-error';
import { HomeMapper } from '../infrastructure/home.mapper';
import type { HomeRepository } from '../infrastructure/home.repository';
import { HomeMessages, type HomeMessagesType } from '../presentation/home.messages';

type ResolvedImage = { url: UrlVO; imageKey?: ImageKey };

export class HomeAppService extends BaseService {
  constructor(
    private readonly homeRepo: HomeRepository,
    private readonly eventBus: IEventBus,
    private readonly imageStorage: IImageStoragePort,
  ) {
    super();
  }

  private async getHomeAggregate(): Promise<HomeAggregate> {
    return this.homeRepo.getHomeMain();
  }

  private async publishEvents(home: HomeAggregate): Promise<void> {
    const events = home.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  /**
   * Persist the aggregate and, on failure, best-effort clean up any image
   * that was uploaded for this exact write (no distributed transactions).
   */
  private async persist(home: HomeAggregate, cleanupKey?: ImageKey): Promise<void> {
    try {
      await this.homeRepo.save(home);
    } catch (error) {
      await this.deleteImage(cleanupKey);
      throw error;
    }
    await this.publishEvents(home);
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

  /**
   * Accepts either an external http(s) URL (stored as-is, unmanaged) or a
   * base64 data URI (uploaded through the provider-neutral storage port).
   */
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

  /** Best-effort cleanup — a failed delete must never fail the request. */
  private async deleteImage(key?: ImageKey): Promise<void> {
    if (!key) return;
    try {
      await this.imageStorage.delete(key);
    } catch (error) {
      console.error(
        `[home] failed to clean up stored image '${key.value}':`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // --- Read Storefront Layout ---
  async getHome(): Promise<HomeResponseReadModel> {
    const home = await this.getHomeAggregate();
    return HomeMapper.aggregateToResponseDto(home);
  }

  // --- Categories ---
  async addCategory(data: CreateHomeCategoryDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const categoryId = Id.create();
    const image = await this.resolveImage(data.image, 'home/categories');
    home.addCategory(
      CategoryVO.create({
        id: categoryId,
        name: Title.create(data.name),
        image: image.url,
        accent: ColorVO.create(data.accent),
        icon: IconVO.create(data.icon),
        imageKey: image.imageKey,
      }),
    );
    await this.persist(home, image.imageKey);
    return HomeMessages.categoryAdded(actorId);
  }

  async updateCategory(
    data: UpdateHomeCategoryDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.categories.find((c) => c.id.equals(targetId));
    if (!existing) {
      throw new NotFoundError(`Category with ID '${data.id}' was not found.`);
    }
    const image = data.image
      ? await this.resolveImage(data.image, 'home/categories')
      : { url: existing.image, imageKey: existing.imageKey };
    home.updateCategory(
      targetId,
      CategoryVO.create({
        id: existing.id,
        name: data.name ? Title.create(data.name) : existing.name,
        image: image.url,
        accent: data.accent ? ColorVO.create(data.accent) : existing.accent,
        icon: data.icon ? IconVO.create(data.icon) : existing.icon,
        imageKey: image.imageKey,
      }),
    );
    await this.persist(home, image.imageKey);
    if (existing.imageKey && !image.imageKey?.equals(existing.imageKey)) {
      await this.deleteImage(existing.imageKey);
    }
    return HomeMessages.categoryUpdated(data.id, actorId);
  }

  async removeCategory(
    data: DeleteHomeCategoryDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.categories.find((c) => c.id.equals(targetId));
    const imageKey = existing?.imageKey;
    home.removeCategory(targetId);
    await this.persist(home);
    await this.deleteImage(imageKey);
    return HomeMessages.categoryRemoved(data.id, actorId);
  }

  async reorderCategories(
    data: ReorderHomeCategoriesDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    home.reorderCategories(data.orderedIds.map((id) => Id.create(id)));
    await this.persist(home);
    return HomeMessages.categoriesReordered(actorId);
  }

  // --- Slides ---
  async addSlide(data: CreateSlideDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const slideId = Id.create();
    const image = await this.resolveImage(data.image, 'home/slides');
    home.addSlide(
      SlideVO.create({
        id: slideId,
        tag: Title.create(data.tag),
        title: Title.create(data.title),
        subhead: Title.create(data.subhead || ''),
        subtitle: Title.create(data.subtitle || ''),
        cta: Title.create(data.cta),
        image: image.url,
        accent: ColorVO.create(data.accent),
        displayOrder:
          data.displayOrder !== undefined
            ? Quantity.create(data.displayOrder)
            : Quantity.create(home.slides.length),
        imageKey: image.imageKey,
      }),
    );
    await this.persist(home, image.imageKey);
    return HomeMessages.slideAdded(actorId);
  }

  async updateSlide(data: UpdateSlideDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.slides.find((s) => s.id.equals(targetId));
    if (!existing) {
      throw new NotFoundError(`Slide with ID '${data.id}' was not found.`);
    }
    const image = data.image
      ? await this.resolveImage(data.image, 'home/slides')
      : { url: existing.image, imageKey: existing.imageKey };
    const updated = SlideVO.create({
      id: existing.id,
      tag: data.tag ? Title.create(data.tag) : existing.tag,
      title: data.title ? Title.create(data.title) : existing.title,
      subhead: data.subhead !== undefined ? Title.create(data.subhead) : existing.subhead,
      subtitle: data.subtitle !== undefined ? Title.create(data.subtitle) : existing.subtitle,
      cta: data.cta ? Title.create(data.cta) : existing.cta,
      image: image.url,
      accent: data.accent ? ColorVO.create(data.accent) : existing.accent,
      displayOrder: existing.displayOrder,
      imageKey: image.imageKey,
    });
    home.updateSlide(targetId, updated);
    await this.persist(home, image.imageKey);
    if (existing.imageKey && !image.imageKey?.equals(existing.imageKey)) {
      await this.deleteImage(existing.imageKey);
    }
    return HomeMessages.slideUpdated(data.id, actorId);
  }

  async removeSlide(data: DeleteSlideDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.slides.find((s) => s.id.equals(targetId));
    const imageKey = existing?.imageKey;
    home.removeSlide(targetId);
    await this.persist(home);
    await this.deleteImage(imageKey);
    return HomeMessages.slideRemoved(data.id, actorId);
  }

  async reorderSlides(data: ReorderSlidesDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    home.reorderSlides(data.orderedIds.map((id) => Id.create(id)));
    await this.persist(home);
    return HomeMessages.slidesReordered(actorId);
  }

  // --- Promos ---
  async addPromo(data: CreatePromoDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const promoId = Id.create();
    const image = await this.resolveImage(data.image, 'home/promos');
    home.addPromo(
      PromoVO.create({
        id: promoId,
        title: Title.create(data.title),
        subtitle: Title.create(data.subtitle),
        image: image.url,
        accent: ColorVO.create(data.accent),
        link: data.link ? UrlVO.create(data.link) : UrlVO.create('https://example.com/client/home'),
        imageKey: image.imageKey,
      }),
    );
    await this.persist(home, image.imageKey);
    return HomeMessages.promoAdded(actorId);
  }

  async updatePromo(data: UpdatePromoDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.promos.find((p) => p.id.equals(targetId));
    if (!existing) {
      throw new NotFoundError(`Promo with ID '${data.id}' was not found.`);
    }
    const image = data.image
      ? await this.resolveImage(data.image, 'home/promos')
      : { url: existing.image, imageKey: existing.imageKey };
    const updated = PromoVO.create({
      id: existing.id,
      title: data.title ? Title.create(data.title) : existing.title,
      subtitle: data.subtitle ? Title.create(data.subtitle) : existing.subtitle,
      image: image.url,
      accent: data.accent ? ColorVO.create(data.accent) : existing.accent,
      link: data.link ? UrlVO.create(data.link) : existing.link,
      imageKey: image.imageKey,
    });
    home.updatePromo(targetId, updated);
    await this.persist(home, image.imageKey);
    if (existing.imageKey && !image.imageKey?.equals(existing.imageKey)) {
      await this.deleteImage(existing.imageKey);
    }
    return HomeMessages.promoUpdated(data.id, actorId);
  }

  async removePromo(data: DeletePromoDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.promos.find((p) => p.id.equals(targetId));
    const imageKey = existing?.imageKey;
    home.removePromo(targetId);
    await this.persist(home);
    await this.deleteImage(imageKey);
    return HomeMessages.promoRemoved(data.id, actorId);
  }

  // --- Features ---
  async addFeature(data: CreateFeatureDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const featureId = Id.create();
    home.addFeature(
      FeatureVO.create({
        id: featureId,
        title: Title.create(data.title),
        detail: Description.create(data.detail),
        accent: ColorVO.create(data.accent),
        icon: IconVO.create(data.icon),
      }),
    );
    await this.persist(home);
    return HomeMessages.featureAdded(actorId);
  }

  async updateFeature(data: UpdateFeatureDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.features.find((f) => f.id.equals(targetId));
    if (!existing) {
      throw new NotFoundError(`Feature with ID '${data.id}' was not found.`);
    }
    const updated = FeatureVO.create({
      id: existing.id,
      title: data.title ? Title.create(data.title) : existing.title,
      detail: data.detail ? Description.create(data.detail) : existing.detail,
      accent: data.accent ? ColorVO.create(data.accent) : existing.accent,
      icon: data.icon ? IconVO.create(data.icon) : existing.icon,
    });
    home.updateFeature(targetId, updated);
    await this.persist(home);
    return HomeMessages.featureUpdated(data.id, actorId);
  }

  async removeFeature(data: DeleteFeatureDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    home.removeFeature(Id.create(data.id));
    await this.persist(home);
    return HomeMessages.featureRemoved(data.id, actorId);
  }

  async setFeatures(data: SetFeaturesDtoType, actorId: string): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const features = data.features.map((f) =>
      FeatureVO.create({
        id: Id.create(),
        title: Title.create(f.title),
        detail: Description.create(f.detail),
        accent: ColorVO.create(f.accent),
        icon: IconVO.create(f.icon),
      }),
    );
    home.setFeatures(features);
    await this.persist(home);
    return HomeMessages.featuresSet(actorId);
  }

  // --- Product Containers ---
  async addProductContainer(
    data: CreateProductContainerDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const containerId = Id.create();
    home.addProductContainer(
      ProductContainerVO.create({
        id: containerId,
        heading: Title.create(data.heading),
        subTitle: Title.create(data.subTitle || ''),
        query: BaseQueryVO.create({
          filter: data.query?.filter as Record<string, unknown> | undefined,
          cursor: data.query?.cursor,
          limit: data.query?.limit !== undefined ? Quantity.create(data.query.limit) : undefined,
          direction: data.query?.direction,
          sort: data.query?.sort as Record<string, 1 | -1> | null | undefined,
        }),
        displayOrder:
          data.displayOrder !== undefined
            ? Quantity.create(data.displayOrder)
            : Quantity.create(home.productContainers.length),
      }),
    );
    await this.persist(home);
    return HomeMessages.containerAdded(containerId.value, actorId);
  }

  async updateProductContainer(
    data: UpdateProductContainerDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    const targetId = Id.create(data.id);
    const existing = home.productContainers.find((c) => c.id.equals(targetId));
    if (!existing) {
      throw new NotFoundError(`Product container with ID '${data.id}' was not found.`);
    }
    const updated = ProductContainerVO.create({
      id: existing.id,
      heading: data.heading ? Title.create(data.heading) : existing.heading,
      subTitle: data.subTitle !== undefined ? Title.create(data.subTitle) : existing.subTitle,
      query: data.query
        ? BaseQueryVO.create({
            filter: data.query.filter as Record<string, unknown> | undefined,
            cursor: data.query.cursor,
            limit: data.query.limit !== undefined ? Quantity.create(data.query.limit) : undefined,
            direction: data.query.direction,
            sort: data.query.sort as Record<string, 1 | -1> | null | undefined,
          })
        : existing.query,
      displayOrder:
        data.displayOrder !== undefined
          ? Quantity.create(data.displayOrder)
          : existing.displayOrder,
    });
    home.updateProductContainer(updated);
    await this.persist(home);
    return HomeMessages.containerUpdated(data.id, actorId);
  }

  async removeProductContainer(
    data: DeleteProductContainerDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    home.removeProductContainer(Id.create(data.id));
    await this.persist(home);
    return HomeMessages.containerRemoved(data.id, actorId);
  }

  async reorderContainers(
    data: ReorderProductContainersDtoType,
    actorId: string,
  ): Promise<HomeMessagesType> {
    const home = await this.getHomeAggregate();
    home.reorderProductContainers(data.orderedIds.map((id) => Id.create(id)));
    await this.persist(home);
    return HomeMessages.containersReordered(actorId);
  }
}
