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
