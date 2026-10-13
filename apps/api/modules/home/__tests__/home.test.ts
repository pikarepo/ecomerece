import { describe, expect, it } from 'bun:test';
import { ReadableStream } from 'node:stream/web';
import type {
  BatchResult,
  BatchStorageCallOptions,
  DownloadOptions,
  IHomeRepository,
  IImageStoragePort,
  ImageStorageError,
  ImageTransform,
  PublicUrlOptions,
  ReplaceOptions,
  SignedUrlOptions,
  StorageCallOptions,
  StoredImage,
  UploadOptions,
} from '@ecomerece/domain';
import {
  CategoryVO,
  ColorVO,
  Description,
  FeatureVO,
  HomeAggregate,
  Id,
  ImageKey,
  ImageMetadata,
  type ImageSource,
  ProductContainerVO,
  PromoVO,
  Quantity,
  SlideVO,
  Title,
  UrlVO,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { BaseQueryVO } from '@ecomerece/domain/value-objects/query.vo';
import { HomeAppService } from '../application/home.app.service';

class InMemoryHomeRepo implements IHomeRepository {
  private home: HomeAggregate | null = null;
  failSave = false;

  async findById(id: Id): Promise<HomeAggregate | null> {
    return this.home && this.home.id.equals(id) ? this.home : null;
  }

  async getHomeMain(): Promise<HomeAggregate> {
    if (!this.home) {
      this.home = HomeAggregate.create(Id.create('home-main'));
    }
    return this.home;
  }

  async save(home: HomeAggregate): Promise<void> {
    if (this.failSave) throw new Error('save failed');
    this.home = home;
  }

  async create(home: HomeAggregate): Promise<void> {
    this.home = home;
  }
}

class InMemoryEventBus implements IEventBus {
  register<T>(eventType: string): void {}

  async publish<T>(): Promise<void> {}

  clear(): void {}
}

class FakeImageStorage implements IImageStoragePort {
  uploaded: ImageSource[] = [];
  deleted: ImageKey[] = [];
  failUpload = false;
  failDelete = false;
  private sequence = 0;

  async upload(source: ImageSource, options?: UploadOptions): Promise<StoredImage> {
    if (this.failUpload) throw new Error('upload failed');
    this.uploaded.push(source);
    const key =
      options?.key ?? ImageKey.create(options?.folder ?? ['home'], `image-${++this.sequence}.png`);
    return { key, publicUrl: `https://cdn.test/${key.value}` };
  }

  async uploadMany(
    sources: ImageSource[],
    _options?: BatchStorageCallOptions,
  ): Promise<BatchResult<StoredImage>> {
    const results: BatchResult<StoredImage> = { succeeded: [], failed: [] };
    for (const source of sources) {
      try {
        const stored = await this.upload(source);
        results.succeeded.push({ key: stored.key, data: stored });
      } catch (error) {
        results.failed.push({
          key: ImageKey.create(['home'], 'unknown.png'),
          error: error as ImageStorageError,
        });
      }
    }
    return results;
  }

  async replace(
    key: ImageKey,
    source: ImageSource,
    options?: ReplaceOptions,
  ): Promise<StoredImage> {
    return this.upload(source, { ...options, key });
  }

  async delete(key: ImageKey, _options?: StorageCallOptions): Promise<void> {
    if (this.failDelete) throw new Error('delete failed');
    this.deleted.push(key);
  }

  async deleteMany(
    keys: ImageKey[],
    _options?: BatchStorageCallOptions,
  ): Promise<BatchResult<void>> {
    const results: BatchResult<void> = { succeeded: [], failed: [] };
    for (const key of keys) {
      try {
        await this.delete(key);
        results.succeeded.push({ key });
      } catch (error) {
        results.failed.push({ key, error: error as ImageStorageError });
      }
    }
    return results;
  }

  async getPublicUrl(key: ImageKey, _options?: PublicUrlOptions): Promise<string> {
    return `https://cdn.test/${key.value}`;
  }

  async getSignedUrl(key: ImageKey, _options?: SignedUrlOptions): Promise<string> {
    return `https://cdn.test/${key.value}?signed=1`;
  }

  async getMetadata(key: ImageKey, _options?: StorageCallOptions): Promise<ImageMetadata> {
    return ImageMetadata.create({ key, sizeBytes: 0, contentType: 'image/png' });
  }

  async getMetadataMany(
    keys: ImageKey[],
    _options?: BatchStorageCallOptions,
  ): Promise<BatchResult<ImageMetadata>> {
    const succeeded = await Promise.all(
      keys.map(async (key) => ({ key, data: await this.getMetadata(key) })),
    );
    return { succeeded, failed: [] };
  }

  async transform(
    key: ImageKey,
    _transform: ImageTransform,
    _options?: StorageCallOptions,
  ): Promise<StoredImage> {
    return { key, publicUrl: `https://cdn.test/${key.value}` };
  }

  async exists(_key: ImageKey, _options?: StorageCallOptions): Promise<boolean> {
    return true;
  }

  async download(_key: ImageKey, _options?: DownloadOptions): Promise<ReadableStream<Uint8Array>> {
    return new ReadableStream<Uint8Array>();
  }
}

const DATA_URI = 'data:image/png;base64,iVBORw0KGgo=';

function createService() {
  const repo = new InMemoryHomeRepo();
  const storage = new FakeImageStorage();
  const service = new HomeAppService(repo as any, new InMemoryEventBus(), storage);
  return { repo, storage, service };
}

describe('HomeAggregate Domain Invariants', () => {
  it('should initialize an empty home aggregate', () => {
    const home = HomeAggregate.create(Id.create('home-main'));
    expect(home.id.value).toBe('home-main');
    expect(home.categories.length).toBe(0);
    expect(home.slides.length).toBe(0);
    expect(home.promos.length).toBe(0);
    expect(home.features.length).toBe(0);
    expect(home.productContainers.length).toBe(0);
  });

  it('should add, update, and remove categories', () => {
    const home = HomeAggregate.create(Id.create('home-main'));
    const cat1 = CategoryVO.create({
      id: Id.create('cat-1'),
      name: Title.create('Laptops'),
      image: UrlVO.create('https://example.com/laptops.jpg'),
      accent: ColorVO.create('#3B82F6'),
    });

    home.addCategory(cat1);
    expect(home.categories.length).toBe(1);
    expect(home.categories[0].name.value).toBe('Laptops');

    // Disallow duplicate category ID
    expect(() => home.addCategory(cat1)).toThrow();

    // Update category
    const cat1Updated = CategoryVO.create({
      id: Id.create('cat-1'),
      name: Title.create('Gaming Laptops'),
      image: UrlVO.create('https://example.com/laptops.jpg'),
      accent: ColorVO.create('#3B82F6'),
    });
    home.updateCategory(Id.create('cat-1'), cat1Updated);
    expect(home.categories[0].name.value).toBe('Gaming Laptops');

    // Remove category
    home.removeCategory(Id.create('cat-1'));
    expect(home.categories.length).toBe(0);
  });

  it('should reorder slides properly', () => {
    const home = HomeAggregate.create(Id.create('home-main'));
    const slide1 = SlideVO.create({
      id: Id.create('slide-1'),
      tag: Title.create('Featured'),
      title: Title.create('Audio'),
      subhead: Title.create('Sound'),
      subtitle: Title.create('Details'),
      cta: Title.create('Shop'),
      image: UrlVO.create('https://example.com/audio.jpg'),
      accent: ColorVO.create('#111111'),
    });
    const slide2 = SlideVO.create({
      id: Id.create('slide-2'),
      tag: Title.create('Monitors'),
      title: Title.create('Displays'),
      subhead: Title.create('4K UHD'),
      subtitle: Title.create('Crisp'),
      cta: Title.create('Explore'),
      image: UrlVO.create('https://example.com/monitor.jpg'),
      accent: ColorVO.create('#222222'),
    });

    home.addSlide(slide1);
    home.addSlide(slide2);
    expect(home.slides[0].id.value).toBe('slide-1');
    expect(home.slides[1].id.value).toBe('slide-2');

    home.reorderSlides([Id.create('slide-2'), Id.create('slide-1')]);
    expect(home.slides[0].id.value).toBe('slide-2');
    expect(home.slides[1].id.value).toBe('slide-1');
  });

  it('should enforce maximum collection limits', () => {
    const home = HomeAggregate.create(Id.create('home-main'));
    for (let i = 0; i < HomeAggregate.MAX_PROMOS; i++) {
      home.addPromo(
        PromoVO.create({
          id: Id.create(`promo-${i}`),
          title: Title.create(`Promo Title ${i}`),
          subtitle: Title.create(`Promo Subtitle ${i}`),
          image: UrlVO.create('https://example.com/promo.jpg'),
          accent: ColorVO.create('#3B82F6'),
        }),
      );
    }
    expect(home.promos.length).toBe(HomeAggregate.MAX_PROMOS);

    // Exceeding MAX_PROMOS should throw invariant violation
    expect(() =>
      home.addPromo(
        PromoVO.create({
          id: Id.create('promo-overflow'),
          title: Title.create('Overflow Promo'),
          subtitle: Title.create('Overflow Subtitle'),
          image: UrlVO.create('https://example.com/overflow.jpg'),
          accent: ColorVO.create('#3B82F6'),
        }),
      ),
    ).toThrow();
  });
});

describe('HomeAppService Full CRUD Operations', () => {
  it('should perform complete categories lifecycle', async () => {
    const { storage, service } = createService();

    // 1. Add Category (id must be server-generated)
    await service.addCategory(
      {
        name: 'Smartphones',
        image: 'https://example.com/phone.jpg',
        accent: '#3B82F6',
        icon: 'Smartphone',
      },
      'admin-1',
    );

    let layout = await service.getHome();
    const catId = layout.categories[0].id;
    expect(layout.categories.length).toBe(1);

    // 2. Update Category
    await service.updateCategory(
      {
        id: catId,
        name: 'Flagship Phones',
      },
      'admin-1',
    );

    layout = await service.getHome();
    expect(layout.categories[0].id).toBe(catId);
    expect(layout.categories[0].name).toBe('Flagship Phones');

    // 3. Remove Category
    await service.removeCategory({ id: catId }, 'admin-1');
    layout = await service.getHome();
    expect(layout.categories.length).toBe(0);
    expect(storage.uploaded.length).toBe(0);
    expect(storage.deleted.length).toBe(0);
  });

  it('should perform complete slides lifecycle', async () => {
    const { service } = createService();

    await service.addSlide(
      {
        tag: 'Summer Sale',
        title: 'Audio Fest',
        subhead: 'Up to 40% Off',
        subtitle: 'Top brand headsets',
        cta: 'Shop Now',
        image: 'https://example.com/slide.jpg',
        accent: '#4A7FB5',
      },
      'admin-1',
    );

    let layout = await service.getHome();
    expect(layout.slides.length).toBe(1);
    const slideId = layout.slides[0].id;
    expect(layout.slides[0].title).toBe('Audio Fest');

    await service.updateSlide(
      {
        id: slideId,
        title: 'Winter Fest',
      },
      'admin-1',
    );

    layout = await service.getHome();
    expect(layout.slides[0].id).toBe(slideId);
    expect(layout.slides[0].title).toBe('Winter Fest');

    await service.removeSlide({ id: slideId }, 'admin-1');
    layout = await service.getHome();
    expect(layout.slides.length).toBe(0);
  });

  it('should perform complete promos lifecycle', async () => {
    const { service } = createService();

    await service.addPromo(
      {
        title: 'Gaming Deals',
        subtitle: 'Desktops & GPUs',
        image: 'https://example.com/promo.jpg',
        accent: '#FB923C',
        link: 'https://example.com/client/gaming',
      },
      'admin-1',
    );

    let layout = await service.getHome();
    expect(layout.promos.length).toBe(1);
    const promoId = layout.promos[0].id;
    expect(layout.promos[0].title).toBe('Gaming Deals');

    await service.updatePromo(
      {
        id: promoId,
        title: 'Next-Gen Gaming Deals',
      },
      'admin-1',
    );

    layout = await service.getHome();
    expect(layout.promos[0].id).toBe(promoId);
    expect(layout.promos[0].title).toBe('Next-Gen Gaming Deals');

    await service.removePromo({ id: promoId }, 'admin-1');
    layout = await service.getHome();
    expect(layout.promos.length).toBe(0);
  });

  it('should perform complete features lifecycle and setFeatures', async () => {
    const { service } = createService();

    await service.setFeatures(
      {
        features: [
          {
            title: 'Free Shipping',
            detail: 'On all orders nationwide over Rs. 2,500',
            accent: '#10B981',
            icon: 'Truck',
          },
          {
            title: 'Official Warranty',
            detail: '100% genuine brand warranty covered',
            accent: '#3B82F6',
            icon: 'ShieldCheck',
          },
        ],
      },
      'admin-1',
    );

    let layout = await service.getHome();
    expect(layout.features.length).toBe(2);
    const feat1 = layout.features[0].id;
    const feat2 = layout.features[1].id;
    expect(layout.features[0].title).toBe('Free Shipping');

    await service.updateFeature(
      {
        id: feat1,
        title: 'Express Shipping',
      },
      'admin-1',
    );

    layout = await service.getHome();
    expect(layout.features[0].id).toBe(feat1);
    expect(layout.features[0].title).toBe('Express Shipping');

    await service.removeFeature({ id: feat2 }, 'admin-1');
    layout = await service.getHome();
    expect(layout.features.length).toBe(1);
  });

  it('should perform complete product containers lifecycle', async () => {
    const { service } = createService();

    await service.addProductContainer(
      {
        heading: 'New Arrivals',
        subTitle: 'Check out the freshest arrivals',
        query: {
          filter: { inStock: true },
          limit: 12,
          direction: 'next',
        },
      },
      'admin-1',
    );

    let layout = await service.getHome();
    expect(layout.productContainers.length).toBe(1);
    const containerId = layout.productContainers[0].id;
    expect(layout.productContainers[0].heading).toBe('New Arrivals');

    await service.updateProductContainer(
      {
        id: containerId,
        heading: 'Featured Arrivals',
      },
      'admin-1',
    );

    layout = await service.getHome();
    expect(layout.productContainers[0].id).toBe(containerId);
    expect(layout.productContainers[0].heading).toBe('Featured Arrivals');

    await service.removeProductContainer({ id: containerId }, 'admin-1');
    layout = await service.getHome();
    expect(layout.productContainers.length).toBe(0);
  });
});

describe('HomeAppService Image Storage Lifecycle', () => {
  it('should upload a data-URI image on category create and persist the public URL', async () => {
    const { repo, storage, service } = createService();

    await service.addCategory(
      { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
      'admin-1',
    );

    expect(storage.uploaded).toHaveLength(1);
    expect(storage.deleted).toHaveLength(0);
    expect(storage.uploaded[0].contentType).toBe('image/png');

    const layout = await service.getHome();
    expect(layout.categories[0].image).toBe('https://cdn.test/home/categories/image-1.png');

    // The storage key is tracked on the aggregate so it can be cleaned up later.
    const home = await repo.getHomeMain();
    expect(home.categories[0].imageKey?.value).toBe('home/categories/image-1.png');
  });

  it('should keep external image URLs untouched (no upload)', async () => {
    const { storage, service } = createService();

    await service.addCategory(
      {
        name: 'Laptops',
        image: 'https://cdn.t.com/laptops.jpg',
        accent: '#3B82F6',
        icon: 'Laptop',
      },
      'admin-1',
    );

    const layout = await service.getHome();
    expect(layout.categories[0].image).toBe('https://cdn.t.com/laptops.jpg');
    expect(storage.uploaded).toHaveLength(0);
    expect(storage.deleted).toHaveLength(0);
  });

  it('should replace a stored image and delete the old one after persistence', async () => {
    const { repo, storage, service } = createService();
    await service.addCategory(
      { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
      'admin-1',
    );
    const layout = await service.getHome();
    const catId = layout.categories[0].id;

    await service.updateCategory({ id: catId, image: DATA_URI }, 'admin-1');

    expect(storage.uploaded).toHaveLength(2);
    expect(storage.deleted).toHaveLength(1);
    expect(storage.deleted[0].value).toBe('home/categories/image-1.png');
    expect((await service.getHome()).categories[0].image).toBe(
      'https://cdn.test/home/categories/image-2.png',
    );
    expect((await repo.getHomeMain()).categories[0].imageKey?.value).toBe(
      'home/categories/image-2.png',
    );
  });

  it('should preserve the stored image when an update does not touch it', async () => {
    const { repo, storage, service } = createService();
    await service.addCategory(
      { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
      'admin-1',
    );
    const layout = await service.getHome();
    const catId = layout.categories[0].id;

    await service.updateCategory({ id: catId, name: 'Flagship Phones' }, 'admin-1');

    expect(storage.uploaded).toHaveLength(1);
    expect(storage.deleted).toHaveLength(0);
    expect((await repo.getHomeMain()).categories[0].imageKey?.value).toBe(
      'home/categories/image-1.png',
    );
  });

  it('should delete the stored image when the entity is removed', async () => {
    const { storage, service } = createService();
    await service.addCategory(
      { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
      'admin-1',
    );
    const layout = await service.getHome();
    const catId = layout.categories[0].id;

    await service.removeCategory({ id: catId }, 'admin-1');

    expect((await service.getHome()).categories).toHaveLength(0);
    expect(storage.deleted).toHaveLength(1);
    expect(storage.deleted[0].value).toBe('home/categories/image-1.png');
  });

  it('should leave the aggregate unchanged when the upload fails', async () => {
    const { repo, storage, service } = createService();
    storage.failUpload = true;

    await expect(
      service.addCategory(
        { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
        'admin-1',
      ),
    ).rejects.toThrow('upload failed');

    expect(storage.uploaded).toHaveLength(0);
    expect((await repo.getHomeMain()).categories).toHaveLength(0);
  });

  it('should clean up a freshly uploaded image when persistence fails', async () => {
    const { repo, storage, service } = createService();
    repo.failSave = true;

    await expect(
      service.addCategory(
        { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
        'admin-1',
      ),
    ).rejects.toThrow('save failed');

    expect(storage.uploaded).toHaveLength(1);
    expect(storage.deleted).toHaveLength(1);
    expect(storage.deleted[0].value).toBe('home/categories/image-1.png');
  });

  it('should swallow storage delete failures on removal', async () => {
    const { storage, service } = createService();
    await service.addCategory(
      { name: 'Smartphones', image: DATA_URI, accent: '#3B82F6', icon: 'Smartphone' },
      'admin-1',
    );
    const layout = await service.getHome();
    const catId = layout.categories[0].id;

    storage.failDelete = true;

    await expect(service.removeCategory({ id: catId }, 'admin-1')).resolves.toBeDefined();
    expect((await service.getHome()).categories).toHaveLength(0);
  });

  it('should run the same lifecycle for slides and promos', async () => {
    const { repo, storage, service } = createService();

    await service.addSlide(
      {
        tag: 'Summer Sale',
        title: 'Audio Fest',
        subhead: 'Up to 40% Off',
        subtitle: 'Top brand headsets',
        cta: 'Shop Now',
        image: DATA_URI,
        accent: '#4A7FB5',
      },
      'admin-1',
    );
    await service.addPromo(
      {
        title: 'Gaming Deals',
        subtitle: 'Desktops & GPUs',
        image: DATA_URI,
        accent: '#FB923C',
        link: 'https://example.com/client/gaming',
      },
      'admin-1',
    );

    const layout = await service.getHome();
    const slideId = layout.slides[0].id;
    const promoId = layout.promos[0].id;

    expect(storage.uploaded).toHaveLength(2);
    expect((await repo.getHomeMain()).slides[0].imageKey?.value).toBe('home/slides/image-1.png');
    expect((await repo.getHomeMain()).promos[0].imageKey?.value).toBe('home/promos/image-2.png');

    await service.removeSlide({ id: slideId }, 'admin-1');
    await service.removePromo({ id: promoId }, 'admin-1');

    expect(storage.deleted.map((k) => k.value)).toEqual([
      'home/slides/image-1.png',
      'home/promos/image-2.png',
    ]);
  });
});
