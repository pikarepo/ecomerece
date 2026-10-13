import {
  CategoryVO,
  FeatureVO,
  HomeAggregate,
  type HomeReadModel,
  ImageKey,
  ProductContainerVO,
  PromoVO,
  SlideVO,
} from '@ecomerece/domain';
import {
  ColorVO,
  Description,
  EffectiveDate,
  IconVO,
  Id,
  Quantity,
  Title,
  UrlVO,
} from '@ecomerece/domain/value-objects';
import { BaseQueryVO } from '@ecomerece/domain/value-objects/query.vo';
import type { HomeResponseReadModel } from '@ecomerece/shared';
import type { HomePersistence } from './home.models';

export const HomeMapper = {
  persistenceToAggregate(doc: HomePersistence & { updatedAt?: Date }): HomeAggregate {
    const categories = (doc.categories ?? []).map((c) =>
      CategoryVO.rehydrate(
        Id.create(c.id),
        Title.create(c.name),
        UrlVO.create(c.image),
        ColorVO.create(c.accent),
        c.icon ? IconVO.rehydrate(c.icon) : undefined,
        c.imageKey ? ImageKey.rehydrate(c.imageKey) : undefined,
      ),
    );
    const features = (doc.features ?? []).map((f) =>
      FeatureVO.rehydrate(
        Id.create(f.id),
        Title.create(f.title),
        Description.create(f.detail),
        ColorVO.create(f.accent),
        f.icon ? IconVO.rehydrate(f.icon) : undefined,
      ),
    );
    const slides = (doc.slides ?? []).map((s) =>
      SlideVO.rehydrate(
        Id.create(s.id),
        Title.create(s.tag),
        Title.create(s.title),
        Title.create(s.subhead ?? ''),
        Title.create(s.subtitle ?? ''),
        Title.create(s.cta),
        UrlVO.create(s.image),
        ColorVO.create(s.accent),
        Quantity.create(s.displayOrder ?? 0),
        s.imageKey ? ImageKey.rehydrate(s.imageKey) : undefined,
      ),
    );
    const promos = (doc.promos ?? []).map((p) =>
      PromoVO.rehydrate(
        Id.create(p.id),
        Title.create(p.title),
        Title.create(p.subtitle),
        UrlVO.create(p.image),
        ColorVO.create(p.accent),
        UrlVO.create(p.link ?? '/client/home'),
        p.imageKey ? ImageKey.rehydrate(p.imageKey) : undefined,
      ),
    );
    const containers = (doc.productContainers ?? []).map((pc) =>
      ProductContainerVO.rehydrate(
        Id.create(pc.id),
        Title.create(pc.heading),
        Title.create(pc.subTitle ?? ''),
        BaseQueryVO.create({
          filter: pc.query.filter as Record<string, unknown> | undefined,
          cursor: pc.query.cursor,
          limit:
            pc.query.limit !== undefined && pc.query.limit !== null
              ? Quantity.create(pc.query.limit)
              : undefined,
          direction: pc.query.direction as 'next' | 'prev' | undefined,
          sort: pc.query.sort as Record<string, 1 | -1> | null | undefined,
        }),
        Quantity.create(pc.displayOrder ?? 0),
      ),
    );
    return HomeAggregate.rehydrate(
      Id.create(doc._id),
      categories,
      features,
      slides,
      promos,
      containers,
      Quantity.create(doc.version ?? 0),
      doc.updatedAt ? EffectiveDate.rehydrate(new Date(doc.updatedAt)) : EffectiveDate.today(),
    );
  },

  aggregateToPersistence(home: HomeAggregate): any {
    return {
      _id: home.id.value,
      categories: home.categories.map((c) => ({
        id: c.id.value,
        name: c.name.value,
        image: c.image.value,
        accent: c.accent.value,
        icon: c.icon?.name ?? 'Box',
        ...(c.imageKey ? { imageKey: c.imageKey.value } : {}),
      })),
      features: home.features.map((f) => ({
        id: f.id.value,
        title: f.title.value,
        detail: f.detail.value,
        accent: f.accent.value,
        icon: f.icon?.name ?? 'Sparkles',
      })),
      slides: home.slides.map((s) => ({
        id: s.id.value,
        tag: s.tag.value,
        title: s.title.value,
        subhead: s.subhead.value,
        subtitle: s.subtitle.value,
        cta: s.cta.value,
        image: s.image.value,
        accent: s.accent.value,
        displayOrder: s.displayOrder.value,
        ...(s.imageKey ? { imageKey: s.imageKey.value } : {}),
      })),
      promos: home.promos.map((p) => ({
        id: p.id.value,
        title: p.title.value,
        subtitle: p.subtitle.value,
        image: p.image.value,
        accent: p.accent.value,
        link: p.link.value,
        ...(p.imageKey ? { imageKey: p.imageKey.value } : {}),
      })),
      productContainers: home.productContainers.map((pc) => ({
        id: pc.id.value,
        heading: pc.heading.value,
        subTitle: pc.subTitle.value,
        query: {
          filter: pc.query.filter,
          cursor: pc.query.cursor ?? null,
          limit: pc.query.limit.value ?? 20,
          direction: pc.query.direction ?? 'next',
          sort: pc.query.sort ?? null,
        },
        displayOrder: pc.displayOrder.value,
      })),
      version: home.version.value,
    };
  },

  aggregateToReadModel(home: HomeAggregate): HomeReadModel {
    return {
      id: home.id.value,
      categories: home.categories.map((c) => ({
        id: c.id.value,
        name: c.name.value,
        image: c.image.value,
        accent: c.accent.value,
        icon: c.icon?.name ?? 'Box',
      })),
      features: home.features.map((f) => ({
        id: f.id.value,
        title: f.title.value,
        detail: f.detail.value,
        accent: f.accent.value,
        icon: f.icon?.name ?? 'Sparkles',
      })),
      slides: home.slides.map((s) => ({
        id: s.id.value,
        tag: s.tag.value,
        title: s.title.value,
        subhead: s.subhead.value,
        subtitle: s.subtitle.value,
        cta: s.cta.value,
        image: s.image.value,
        accent: s.accent.value,
        displayOrder: s.displayOrder.value,
      })),
      promos: home.promos.map((p) => ({
        id: p.id.value,
        title: p.title.value,
        subtitle: p.subtitle.value,
        image: p.image.value,
        accent: p.accent.value,
        link: p.link.value,
      })),
      productContainers: home.productContainers.map((pc) => ({
        id: pc.id.value,
        heading: pc.heading.value,
        subTitle: pc.subTitle.value,
        query: {
          filter: pc.query.filter,
          cursor: pc.query.cursor,
          limit: pc.query.limit.value,
          direction: pc.query.direction,
          sort: pc.query.sort,
        },
        displayOrder: pc.displayOrder.value,
      })),
      version: home.version.value,
      updatedAt: home.updatedAt.value,
    };
  },

  aggregateToResponseDto(home: HomeAggregate): HomeResponseReadModel {
    return HomeMapper.aggregateToReadModel(home);
  },
};
