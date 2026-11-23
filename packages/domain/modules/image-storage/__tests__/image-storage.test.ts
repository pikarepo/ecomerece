import { describe, expect, it } from 'bun:test';
import {
  ImageAbortedError,
  ImageInvalidKeyError,
  ImageKey,
  ImageMetadata,
  ImageNotFoundError,
  ImageSource,
  ImageStorageError,
  ImageTransform,
} from '@ecomerece/domain';
import { AppError } from '../../../errors/app-error';

describe('ImageKey', () => {
  it('builds a normalized key from folder and file name', () => {
    const key = ImageKey.create(['products', 'p-1'], 'hero.jpg');
    expect(key.value).toBe('products/p-1/hero.jpg');
    expect(key.folder).toBe('products/p-1');
    expect(key.fileName).toBe('hero.jpg');
    expect(key.extension).toBe('jpg');
  });

  it('normalizes stray slashes and empty segments', () => {
    const key = ImageKey.create(['products/', '/p-1/'], '/hero.jpg');
    expect(key.value).toBe('products/p-1/hero.jpg');
  });

  it('rejects path traversal, leading slashes and control characters', () => {
    expect(() => ImageKey.create('..', 'evil.jpg')).toThrow(ImageInvalidKeyError);
    expect(() => ImageKey.rehydrate('../evil.jpg')).toThrow(ImageInvalidKeyError);
    expect(() => ImageKey.rehydrate('/leading.jpg')).toThrow(ImageInvalidKeyError);
    expect(() => ImageKey.rehydrate('bad\u0000name.jpg')).toThrow(ImageInvalidKeyError);
    expect(() => ImageKey.rehydrate('')).toThrow(ImageInvalidKeyError);
  });

  it('supports folder movement and suffixing', () => {
    const key = ImageKey.create('images', 'a.jpg');
    expect(key.inFolder('archive').value).toBe('archive/images/a.jpg');
    expect(key.withSuffix('_thumb').value).toBe('images/a_thumb.jpg');
    expect(key.equals('images/a.jpg')).toBe(true);
    expect(key.toString()).toBe('images/a.jpg');
  });
});

describe('ImageSource', () => {
  it('computes sizeBytes from a byte buffer', () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const source = ImageSource.fromBytes(bytes, 'image/jpeg', 'a.jpg');
    expect(source.contentType).toBe('image/jpeg');
    expect(source.sizeBytes).toBe(4);
    expect(source.fileName).toBe('a.jpg');
  });

  it('creates a stream source without a known size', () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1]));
        controller.close();
      },
    });
    const source = ImageSource.fromStream(stream, 'image/png');
    expect(source.data).toBe(stream);
    expect(source.sizeBytes).toBeUndefined();
  });
});

describe('ImageMetadata', () => {
  it('exposes provider-neutral cache and size information', () => {
    const key = ImageKey.create('images', 'a.jpg');
    const metadata = ImageMetadata.create({
      key,
      sizeBytes: 2048,
      contentType: 'image/jpeg',
      width: 800,
      height: 600,
      etag: '"abc123"',
      cacheControl: 'public, max-age=31536000',
      access: 'public',
    });

    expect(metadata.etag).toBe('"abc123"');
    expect(metadata.cacheControl).toContain('max-age=31536000');
    expect(metadata.width).toBe(800);
    expect(metadata.key.equals(key)).toBe(true);
    expect(metadata.toObject().key).toBe('images/a.jpg');
  });
});

describe('ImageTransform', () => {
  it('accepts a resizing transform', () => {
    const transform = ImageTransform.create({
      width: 400,
      height: 400,
      fit: 'cover',
      format: 'webp',
      quality: 80,
    });
    expect(transform.width).toBe(400);
    expect(transform.format).toBe('webp');
    expect(transform.toObject()).toMatchObject({ fit: 'cover' });
  });

  it('rejects invalid quality values', () => {
    expect(() => ImageTransform.create({ quality: 101 })).toThrow(ImageInvalidKeyError);
    expect(() => ImageTransform.create({ quality: 0 })).toThrow(ImageInvalidKeyError);
    expect(() => ImageTransform.create({ width: -1 })).toThrow(ImageInvalidKeyError);
  });

  it('duplicates equal transforms', () => {
    const a = ImageTransform.create({ width: 100, height: 100 });
    const b = ImageTransform.create({ width: 100, height: 100 });
    expect(a.equals(b)).toBe(true);
  });
});

describe('ImageStorageError hierarchy', () => {
  it('subclasses AppError and is caught as one', () => {
    const err = new ImageNotFoundError();
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(ImageStorageError);
    expect(err.code).toBe('IMAGE_STORAGE_NOT_FOUND');
    expect(err.status).toBe(404);
  });

  it('provides provider-neutral error kinds', () => {
    expect(new ImageAbortedError().code).toBe('IMAGE_STORAGE_ABORTED');
    expect(new ImageStorageError('boom').status).toBe(502);
  });
});

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

describe('hostile image transforms', () => {
  it('DOM-H3-CONTROL keeps finite transform inputs valid', () => {
    const transform = ImageTransform.create({
      width: 400,
      height: 300,
      quality: 80,
      blur: 2,
      sharpen: 3,
    });

    expect(transform.width).toBe(400);
    expect(transform.height).toBe(300);
    expect(transform.quality).toBe(80);
  });

  it.failing('DOM-H3 create accepts NaN width, quality, blur and sharpen', () => {
    expect(ImageTransform.create({ width: 400, quality: 80 }).width).toBe(400);
    const exploit = ImageTransform.create({
      width: Number.NaN,
      quality: Number.NaN,
      blur: Number.NaN,
      sharpen: Number.NaN,
    }).toObject();

    domainEvidence('H3', {
      width: String(exploit.width),
      quality: String(exploit.quality),
      blur: String(exploit.blur),
      sharpen: String(exploit.sharpen),
    });
    expect(() =>
      ImageTransform.create({
        width: Number.NaN,
        quality: Number.NaN,
        blur: Number.NaN,
        sharpen: Number.NaN,
      }),
    ).toThrow(ImageInvalidKeyError);
  });

  it.failing('DOM-H3 create accepts an infinite width', () => {
    expect(ImageTransform.create({ height: 300 }).height).toBe(300);
    const exploit = ImageTransform.create({ width: Number.POSITIVE_INFINITY }).toObject();

    domainEvidence('H3-INF', { width: String(exploit.width) });
    expect(() => ImageTransform.create({ width: Number.POSITIVE_INFINITY })).toThrow(
      ImageInvalidKeyError,
    );
  });

  it('DOM-H3-CONTROL create already rejects an infinite quality', () => {
    const exploit = (() => {
      try {
        ImageTransform.create({ quality: Number.POSITIVE_INFINITY });
        return 'accepted';
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    })();

    domainEvidence('H3-INF-QUALITY', { exploit });
    expect(() => ImageTransform.create({ quality: Number.POSITIVE_INFINITY })).toThrow(
      ImageInvalidKeyError,
    );
  });

  it.failing('DOM-H3 create accepts NaN crop dimensions', () => {
    expect(ImageTransform.create({ crop: { x: 0, y: 0, width: 10, height: 10 } }).crop?.width).toBe(
      10,
    );
    const exploit = ImageTransform.create({
      crop: { x: 0, y: 0, width: Number.NaN, height: 10 },
    }).toObject();

    domainEvidence('H3-CROP', { width: String(exploit.crop?.width), height: exploit.crop?.height });
    expect(() =>
      ImageTransform.create({ crop: { x: 0, y: 0, width: Number.NaN, height: 10 } }),
    ).toThrow(ImageInvalidKeyError);
  });
});

describe('hostile image metadata', () => {
  const validProps = {
    key: ImageKey.create('images', 'a.jpg'),
    sizeBytes: 2048,
    contentType: 'image/jpeg',
    width: 800,
    height: 600,
  };

  it('DOM-H4-CONTROL keeps positive metadata valid', () => {
    expect(ImageMetadata.create(validProps).sizeBytes).toBe(2048);
  });

  it.failing('DOM-H4 create accepts negative size and dimensions', () => {
    expect(ImageMetadata.create(validProps).width).toBe(800);
    const exploit = ImageMetadata.create({
      ...validProps,
      sizeBytes: -1,
      width: -800,
      height: -600,
    });

    domainEvidence('H4-CREATE', {
      sizeBytes: exploit.sizeBytes,
      width: exploit.width,
      height: exploit.height,
    });
    expect(() =>
      ImageMetadata.create({ ...validProps, sizeBytes: -1, width: -800, height: -600 }),
    ).toThrow(ImageInvalidKeyError);
  });

  it.failing('DOM-H4 rehydrate accepts negative size and dimensions', () => {
    expect(ImageMetadata.rehydrate(validProps).sizeBytes).toBe(2048);
    const exploit = ImageMetadata.rehydrate({ ...validProps, sizeBytes: -1, width: -800 });

    domainEvidence('H4-REHYDRATE', { sizeBytes: exploit.sizeBytes, width: exploit.width });
    expect(() => ImageMetadata.rehydrate({ ...validProps, sizeBytes: -1, width: -800 })).toThrow(
      ImageInvalidKeyError,
    );
  });
});
