/** @jsxImportSource react */

import { Camera, Check, ClipboardPaste, File as FileIcon, RefreshCw, X } from 'lucide-react';
import { type ClipboardEvent, type DragEvent, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Progress } from '../data/Progress';

/**
 * Upload upgrades (todo/09 batch 66): a per-file upload queue with progress,
 * camera capture and a paste/drop image zone. Folder DnD, chunked/resumable and
 * the video trimmer are ⛔ heavyweight and left as own tasks. `mat-*` + tokens.
 */

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  name: string;
  size?: number;
  progress: number;
  status: UploadStatus;
  thumbnail?: string;
  error?: string;
}

export interface UploadQueueProps {
  items: UploadItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export function UploadQueue({ items, onRemove, onRetry, className }: UploadQueueProps) {
  return (
    <ul className={cn('flex flex-col gap-2', className)} aria-label="Upload queue">
      {items.map((item) => (
        <li
          key={item.id}
          className="mat-raised flex items-center gap-3 rounded-control border border-line/30 p-2"
        >
          <span className="mat-well grid size-10 shrink-0 place-items-center overflow-hidden rounded-control">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" className="size-full object-cover" />
            ) : (
              <FileIcon className="size-5 text-ink-3" aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-ink">{item.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-ink-3">
                {item.status === 'uploading' && `${Math.round(item.progress)}%`}
                {item.status === 'done' && <Check className="size-4 text-success" aria-hidden />}
                {item.size ? ` ${formatBytes(item.size)}` : ''}
              </span>
            </span>
            {item.status === 'error' ? (
              <span className="text-xs text-danger">{item.error ?? 'Upload failed'}</span>
            ) : (
              <Progress
                value={item.progress}
                tone={item.status === 'done' ? 'success' : 'accent'}
                className="mt-1"
              />
            )}
          </span>
          {item.status === 'error' && (
            <button
              type="button"
              aria-label={`Retry ${item.name}`}
              onClick={() => onRetry?.(item.id)}
              className={cn('shrink-0 rounded-control p-1 text-ink-3 hover:text-ink', focusRing())}
            >
              <RefreshCw className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => onRemove?.(item.id)}
            className={cn('shrink-0 rounded-control p-1 text-ink-4 hover:text-ink', focusRing())}
          >
            <X className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

export interface CameraCaptureProps {
  onCapture?: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export function CameraCapture({
  onCapture,
  accept = 'image/*',
  label = 'Take photo',
  className,
}: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mat-control inline-flex items-center gap-2 rounded-control px-3.5 py-2 text-sm text-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
          focusRing(),
          className,
        )}
      >
        <Camera className="size-4" aria-hidden />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        aria-label="Camera capture"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onCapture?.(file);
          e.currentTarget.value = '';
        }}
      />
    </>
  );
}

export interface PasteImageZoneProps {
  onFiles?: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function PasteImageZone({
  onFiles,
  label = 'Paste an image here',
  hint = 'Press Ctrl/⌘+V or drop a screenshot',
  className,
}: PasteImageZoneProps) {
  const [dragging, setDragging] = useState(false);
  const collect = (list: FileList | File[]) => {
    const images = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (images.length) onFiles?.(images);
  };
  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(e.clipboardData?.items ?? [])
      .filter((i) => i.kind === 'file')
      .map((i) => i.getAsFile())
      .filter((f): f is File => Boolean(f));
    if (files.length) {
      e.preventDefault();
      onFiles?.(files);
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    collect(e.dataTransfer.files);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: paste/drop target; no pointer action is taken on click, only file collection
    <div
      // biome-ignore lint/a11y/noNoninteractiveTabindex: this region must be keyboard-focusable to receive Ctrl/⌘+V
      tabIndex={0}
      onPaste={onPaste}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      data-dragging={dragging ? 'true' : undefined}
      className={cn(
        'mat-well flex flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed border-line/30 px-6 py-8 text-center transition-all duration-skin ease-skin',
        dragging && 'border-accent bg-surface-2',
        focusRing(),
        className,
      )}
    >
      <ClipboardPaste className="size-7 text-ink-4" aria-hidden />
      <span className="text-sm font-medium text-ink-2">{label}</span>
      <span className="text-xs text-ink-3">{hint}</span>
    </div>
  );
}
