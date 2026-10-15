/** @jsxImportSource react */

import { AlertCircle, Check, Loader2, Pencil, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Validation parts (todo/09 batch 67): async-validation spinner, dirty/touched
 * indicator, unsaved-changes prompt, error focus-first-field and a validation
 * summary. `mat-*` + tokens only.
 */

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface AsyncValidationIndicatorProps {
  status: ValidationStatus;
  message?: string;
  className?: string;
}

export function AsyncValidationIndicator({
  status,
  message,
  className,
}: AsyncValidationIndicatorProps) {
  if (status === 'idle') return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-1.5 text-xs', className)}
    >
      {status === 'validating' && (
        <>
          <Loader2 className="size-3.5 animate-spin text-ink-3" aria-hidden />
          <span className="text-ink-3">{message ?? 'Checking…'}</span>
        </>
      )}
      {status === 'valid' && (
        <>
          <Check className="size-3.5 text-success" aria-hidden />
          <span className="text-success">{message ?? 'Looks good'}</span>
        </>
      )}
      {status === 'invalid' && (
        <>
          <AlertCircle className="size-3.5 text-danger" aria-hidden />
          <span className="text-danger">{message ?? 'Invalid'}</span>
        </>
      )}
    </div>
  );
}

export interface DirtyIndicatorProps {
  dirty?: boolean;
  touched?: boolean;
  dirtyLabel?: string;
  savedLabel?: string;
  className?: string;
}

export function DirtyIndicator({
  dirty = false,
  touched = false,
  dirtyLabel = 'Unsaved changes',
  savedLabel = 'Saved',
  className,
}: DirtyIndicatorProps) {
  if (!touched && !dirty) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        dirty ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
        className,
      )}
    >
      {dirty ? <Pencil className="size-3" aria-hidden /> : <Check className="size-3" aria-hidden />}
      {dirty ? dirtyLabel : savedLabel}
    </span>
  );
}

/** Focus the first `[aria-invalid="true"]` element inside `root` (if any). */
export function focusFirstInvalid(root: ParentNode): HTMLElement | null {
  const el = root.querySelector<HTMLElement>('[aria-invalid="true"]');
  el?.focus();
  return el;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationSummaryProps {
  issues: ValidationIssue[];
  title?: string;
  onIssueClick?: (field: string) => void;
  className?: string;
}

export function ValidationSummary({
  issues,
  title = 'Please fix the following:',
  onIssueClick,
  className,
}: ValidationSummaryProps) {
  if (issues.length === 0) return null;
  return (
    <div
      role="alert"
      className={cn('rounded-card border border-danger/40 bg-danger/5 p-3', className)}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-danger">
        <AlertCircle className="size-4" aria-hidden />
        {title}
      </p>
      <ul className="flex flex-col gap-0.5">
        {issues.map((issue) => (
          <li key={issue.field}>
            <button
              type="button"
              onClick={() => onIssueClick?.(issue.field)}
              className={cn(
                'text-left text-sm text-danger underline-offset-2 hover:underline',
                focusRing(),
              )}
            >
              {issue.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Warn before leaving while `when` is true. Returns nothing; pair with a bar. */
export function useBeforeUnload(when: boolean): void {
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);
}

export interface UnsavedChangesBarProps {
  when?: boolean;
  message?: string;
  onSave?: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
  discardLabel?: string;
  className?: string;
}

export function UnsavedChangesBar({
  when = false,
  message = 'You have unsaved changes.',
  onSave,
  onDiscard,
  saveLabel = 'Save',
  discardLabel = 'Discard',
  className,
}: UnsavedChangesBarProps) {
  useBeforeUnload(when);
  if (!when) return null;
  return (
    <div
      role="status"
      className={cn(
        'mat-overlay flex items-center justify-between gap-3 rounded-card border border-line/30 px-4 py-2.5 shadow-lg',
        className,
      )}
    >
      <span className="text-sm text-ink-2">{message}</span>
      <span className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onDiscard?.()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-1',
            focusRing(),
          )}
        >
          <X className="size-4" aria-hidden />
          {discardLabel}
        </button>
        <button
          type="button"
          onClick={() => onSave?.()}
          className={cn(
            'mat-primary inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm text-accent-ink active:scale-[var(--press-scale)]',
            focusRing(),
          )}
        >
          <Save className="size-4" aria-hidden />
          {saveLabel}
        </button>
      </span>
    </div>
  );
}
