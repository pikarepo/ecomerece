/** @jsxImportSource react */
import { Upload, X } from 'lucide-react';
import { type DragEvent, useId, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface FileUploadProps {
  /** Called whenever the file list changes. */
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onFilesChange,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  label = 'Drop files here or click to browse',
  hint,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const process = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const valid: File[] = [];
    const errs: string[] = [];
    for (const f of list) {
      if (maxSize && f.size > maxSize) {
        errs.push(`"${f.name}" exceeds the ${formatBytes(maxSize)} limit.`);
      } else {
        valid.push(f);
      }
    }
    const next = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(next);
    setErrors(errs);
    onFilesChange(next);
  };

  const remove = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) process(e.dataTransfer.files);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* drop zone */}
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-dragging={dragging ? 'true' : undefined}
        className={cn(
          'mat-well flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card',
          'border-2 border-dashed border-line/30 px-6 py-10 text-center',
          'transition-all duration-skin ease-skin',
          dragging && 'border-accent bg-surface-2',
          disabled && 'cursor-not-allowed opacity-50',
          focusRing(),
        )}
      >
        <Upload className="size-8 text-ink-4" aria-hidden="true" />
        <span className="text-sm font-medium text-ink-2">{label}</span>
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
        {maxSize && <span className="text-xs text-ink-4">Max {formatBytes(maxSize)} per file</span>}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => process(e.target.files)}
        />
      </label>

      {/* error list */}
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="text-xs text-danger">
              {err}
            </li>
          ))}
        </ul>
      )}

      {/* file list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5" aria-label="Selected files">
          {files.map((file, i) => (
            <li
              key={i}
              className="mat-raised flex items-center gap-2 rounded-control px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate text-ink">{file.name}</span>
              <span className="shrink-0 text-xs text-ink-3">{formatBytes(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => remove(i)}
                className={cn(
                  'shrink-0 rounded-chip p-0.5 text-ink-4 transition-colors duration-skin ease-skin hover:text-ink',
                  focusRing(),
                )}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
