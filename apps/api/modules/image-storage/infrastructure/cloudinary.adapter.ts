import { createHash } from 'node:crypto';
import type { ReadableStream } from 'node:stream/web';
import type {
  BatchResult,
  BatchStorageCallOptions,
  DownloadOptions,
  IImageStoragePort,
  PublicUrlOptions,
  ReplaceOptions,
  SignedUrlOptions,
  StorageCallOptions,
  UploadOptions,
} from '@ecomerece/domain';
import {
  ImageAbortedError,
  ImageAccessDeniedError,
  ImageDeleteFailedError,
  ImageKey,
  ImageMetadata,
  ImageNotFoundError,
  ImageRateLimitedError,
  type ImageSource,
  ImageStreamError,
  type ImageTransform,
  ImageUploadFailedError,
} from '@ecomerece/domain';
import type { CloudinaryConfig } from './cloudinary.config';

// Cloudinary REST response shapes

interface CloudinaryUploadResponse {
  public_id: string;
  format: string;
  version: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  etag: string;
  created_at: string;
  folder: string;
}

interface CloudinaryResourceResponse {
  public_id: string;
  format: string;
  version: string;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  secure_url: string;
  etag: string;
  folder: string;
  tags: string[];
  context?: string;
  access_control?: { start_at?: string; end_at?: string }[];
}

interface CloudinaryDestroyResponse {
  result: 'ok' | 'not found' | 'error';
  error?: { message: string };
}

// Adapter

export class CloudinaryAdapter implements IImageStoragePort {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly folder: string | undefined;
  private readonly apiUrl: string;
  private readonly cdnBase: string;

  constructor(config: CloudinaryConfig) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.folder = config.folder;
    this.apiUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}`;
    this.cdnBase = `https://res.cloudinary.com/${config.cloudName}`;
  }

  // Upload

  async upload(source: ImageSource, options?: UploadOptions) {
    const key = this.resolveKey(source, options);
    const timestamp = Math.floor(Date.now() / 1000);

    const metaParams: Record<string, string> = {
      public_id: key.value,
      timestamp: String(timestamp),
    };
    if (options?.overwrite) metaParams.overwrite = 'true';
    if (options?.cacheControl) metaParams.cache_control = options.cacheControl;
    if (options?.tags) metaParams.tags = options.tags.join(',');
    if (options?.customMetadata) metaParams.context = this.encodeContext(options.customMetadata);
    if (options?.access === 'private') metaParams.type = 'authenticated';

    const signature = this.sign(metaParams);
    metaParams.api_key = this.apiKey;
    metaParams.signature = signature;

    const formData = new FormData();
    const blob = await this.sourceToBlob(source);
    formData.append('file', blob, key.fileName);
    for (const [k, v] of Object.entries(metaParams)) {
      formData.append(k, v);
    }

    const res = await fetch(`${this.apiUrl}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: options?.signal,
    });

    if (!res.ok) await this.throwUploadError(res);

    const data = (await res.json()) as CloudinaryUploadResponse;
    return this.toStoredImage(data, key);
  }

  async uploadMany(
    sources: ImageSource[],
    options?: BatchStorageCallOptions,
  ): Promise<BatchResult<ReturnType<typeof this.toStoredImage>>> {
    return this.batchRun(sources, (source) => this.upload(source, { ...options, overwrite: true }));
  }

  // Replace

  async replace(key: ImageKey, source: ImageSource, options?: ReplaceOptions) {
    if (!options?.createIfMissing) {
      if (!(await this.exists(key, { signal: options?.signal }))) {
        throw new ImageNotFoundError(`No object found at key "${key.value}" to replace.`);
      }
    }
    return this.upload(source, { ...options, key, overwrite: true });
  }

  // Delete

  async delete(key: ImageKey, options?: StorageCallOptions): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      public_id: key.value,
      timestamp: String(timestamp),
    };
    const signature = this.sign(params);
    params.api_key = this.apiKey;
    params.signature = signature;

    const formBody = new URLSearchParams(params);

    const res = await fetch(`${this.apiUrl}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
      signal: options?.signal,
    });

    if (!res.ok) await this.throwDestroyError(res);

    const data = (await res.json()) as CloudinaryDestroyResponse;
    if (data.result === 'error') {
      throw new ImageDeleteFailedError(
        `Cloudinary reported an error deleting "${key.value}": ${data.error?.message ?? 'unknown'}`,
      );
    }
  }

  async deleteMany(
    keys: ImageKey[],
    options?: BatchStorageCallOptions,
  ): Promise<BatchResult<void>> {
    return this.batchRun(keys, (key) => this.delete(key, options));
  }

  // URLs

  async getPublicUrl(key: ImageKey, options?: PublicUrlOptions): Promise<string> {
    const transformPart = options?.transform
      ? `/${this.buildTransformString(options.transform)}`
      : '';
    const ext = key.extension ? `.${key.extension}` : '';

    let url = `${this.cdnBase}/image/upload${transformPart}/${key.value}${ext}`;

    if (options?.fileName) {
      url += `?fl=${encodeURIComponent(options.fileName)}`;
    }
    return url;
  }

  async getSignedUrl(key: ImageKey, options?: SignedUrlOptions): Promise<string> {
    const expiresInSeconds = options?.expiresInSeconds ?? 3600;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const ext = key.extension ? `.${key.extension}` : '';
    const transformPart = options?.transform
      ? `/${this.buildTransformString(options.transform)}`
      : '';

    const payload = `${key.value}${ext}${expiresAt}`;
    const signature = createHash('sha1').update(`${payload}${this.apiSecret}`).digest('hex');

    const params = new URLSearchParams({
      api_key: this.apiKey,
      timestamp: String(expiresAt),
      signature,
    });

    if (options?.responseDisposition) {
      params.set('response-content-disposition', options.responseDisposition);
    }

    return `${this.cdnBase}/image/upload${transformPart}/${key.value}${ext}?${params.toString()}`;
  }

  // Metadata

  async getMetadata(key: ImageKey, options?: StorageCallOptions) {
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      public_id: key.value,
      timestamp: String(timestamp),
    };
    const signature = this.sign(params);
    params.api_key = this.apiKey;
    params.signature = signature;

    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(
      `${this.apiUrl}/resources/image/upload/${encodeURIComponent(key.value)}?${queryString}`,
      { method: 'GET', signal: options?.signal },
    );

    if (res.status === 404) {
      throw new ImageNotFoundError(`No object found at key "${key.value}".`);
    }
    if (!res.ok) await this.throwDestroyError(res);

    const data = (await res.json()) as CloudinaryResourceResponse;
    return this.toImageMetadata(data, key);
  }

  async getMetadataMany(keys: ImageKey[], options?: BatchStorageCallOptions) {
    return this.batchRun(keys, (key) => this.getMetadata(key, options));
  }

  // Transform

  async transform(key: ImageKey, transform: ImageTransform, options?: StorageCallOptions) {
    if (!(await this.exists(key, { signal: options?.signal }))) {
      throw new ImageNotFoundError(`No object found at key "${key.value}" to transform.`);
    }
    const publicUrl = await this.getPublicUrl(key, { transform });
    return { key, publicUrl, version: undefined };
  }

  // Exists

  async exists(key: ImageKey, options?: StorageCallOptions): Promise<boolean> {
    try {
      await this.getMetadata(key, options);
      return true;
    } catch (error) {
      if (error instanceof ImageNotFoundError) return false;
      throw error;
    }
  }

  // Download

  async download(key: ImageKey, options?: DownloadOptions): Promise<ReadableStream<Uint8Array>> {
    const url = await this.getPublicUrl(key);
    const headers: Record<string, string> = {};
    if (options?.range) {
      headers.Range = `bytes=${options.range.start}-${options.range.end ?? ''}`;
    }

    const res = await fetch(url, { signal: options?.signal, headers });
    if (!res.ok) {
      throw new ImageStreamError(
        `Failed to download "${key.value}" from Cloudinary (HTTP ${res.status}).`,
      );
    }
    if (!res.body) {
      throw new ImageStreamError(`No response body received for "${key.value}".`);
    }
    return res.body as unknown as ReadableStream<Uint8Array>;
  }

  // Internals

  private sign(params: Record<string, string>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    return createHash('sha1').update(`${sorted}${this.apiSecret}`).digest('hex');
  }

  private resolveKey(source: ImageSource, options?: UploadOptions): ImageKey {
    if (options?.key) return options.key;

    const folder = options?.folder
      ? Array.isArray(options.folder)
        ? options.folder.join('/')
        : options.folder
      : this.folder;

    const fileName = options?.fileName ?? source.fileName ?? crypto.randomUUID();
    return ImageKey.create(folder ?? [], fileName);
  }

  private async sourceToBlob(source: ImageSource): Promise<Blob> {
    const data = source.data;

    if (data instanceof Uint8Array) {
      return new Blob([data], { type: source.contentType });
    }
    if (data instanceof ArrayBuffer) {
      return new Blob([new Uint8Array(data)], { type: source.contentType });
    }

    // ReadableStream — accumulate into a single buffer
    const chunks: Uint8Array[] = [];
    const reader = (data as ReadableStream<Uint8Array>).getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new ImageAbortedError();
      throw error;
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return new Blob([buffer], { type: source.contentType });
  }

  private encodeContext(context: Record<string, string>): string {
    return Object.entries(context)
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
  }

  private buildTransformString(transform: ImageTransform): string {
    if (transform.preset) return transform.preset;

    const parts: string[] = [];
    if (transform.width || transform.height) {
      const w = transform.width ?? '_';
      const h = transform.height ?? '_';
      const fit = transform.fit === 'fill' ? 'fill' : transform.fit === 'contain' ? 'fit' : 'limit';
      parts.push(`${fit}_${w}_${h}`);
    }
    if (transform.format) parts.push(transform.format);
    if (transform.quality) parts.push(`q_${transform.quality}`);
    if (transform.rotate) parts.push(`a_${transform.rotate}`);
    if (transform.flip) parts.push('fliph');
    if (transform.flop) parts.push('flipv');
    if (transform.blur) parts.push(`bl_${transform.blur}`);
    if (transform.sharpen) parts.push(`sh_${transform.sharpen}`);
    if (transform.background) parts.push(`b_${transform.background.replace('#', '')}`);
    if (transform.crop) {
      const c = transform.crop;
      parts.push(`c_crop,x_${c.x},y_${c.y},w_${c.width},h_${c.height}`);
    }
    return parts.filter(Boolean).join('/');
  }

  private toStoredImage(data: CloudinaryUploadResponse, key: ImageKey) {
    return {
      key,
      publicUrl: data.secure_url,
      version: String(data.version),
      metadata: ImageMetadata.create({
        key,
        sizeBytes: data.bytes,
        contentType: `image/${data.format}`,
        width: data.width,
        height: data.height,
        format: data.format,
        etag: data.etag,
        createdAt: new Date(data.created_at),
      }),
    };
  }

  private toImageMetadata(data: CloudinaryResourceResponse, key: ImageKey) {
    return ImageMetadata.create({
      key,
      sizeBytes: data.bytes,
      contentType: `image/${data.format}`,
      width: data.width,
      height: data.height,
      format: data.format,
      etag: data.etag,
      createdAt: new Date(data.created_at),
      access: data.access_control && data.access_control.length > 0 ? 'private' : 'public',
      cacheControl: 'public, max-age=31536000',
    });
  }

  private async batchRun<TInput, TOutput>(
    items: TInput[],
    fn: (item: TInput, index: number) => Promise<TOutput>,
    options?: BatchStorageCallOptions,
  ): Promise<BatchResult<TOutput>> {
    const concurrency = options?.concurrency ?? 10;
    const continueOnError = options?.continueOnError ?? true;
    const succeeded: BatchResult<TOutput>['succeeded'] = [];
    const failed: BatchResult<TOutput>['failed'] = [];

    let cursor = 0;
    const worker = async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        const item = items[index];
        const key = item instanceof ImageKey ? item : ImageKey.rehydrate(`batch-${index}`);
        try {
          const data = await fn(item, index);
          succeeded.push({ key, data });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          failed.push({ key, error: err as any, retryable: true });
          if (!continueOnError) throw error;
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.allSettled(workers);

    return { succeeded, failed };
  }

  private async throwUploadError(res: Response): Promise<never> {
    let message = `Cloudinary upload failed (HTTP ${res.status}).`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {}
    if (res.status === 404) throw new ImageNotFoundError(message);
    if (res.status === 401 || res.status === 403) throw new ImageAccessDeniedError(message);
    if (res.status === 429) throw new ImageRateLimitedError(message);
    throw new ImageUploadFailedError(message);
  }

  private async throwDestroyError(res: Response): Promise<never> {
    let message = `Cloudinary request failed (HTTP ${res.status}).`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {}
    if (res.status === 401 || res.status === 403) throw new ImageAccessDeniedError(message);
    throw new ImageDeleteFailedError(message);
  }
}
