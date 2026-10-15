/** @jsxImportSource react */

import { Check, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Form layouts (todo/09 batch 68): stepper/wizard form, tabbed form,
 * one-question-at-a-time, conditional fields and a field array. The survey
 * builder is ⛔ heavyweight (own task). `mat-*` + tokens only.
 */

export interface WizardStep {
  id: string;
  label: string;
  content?: ReactNode;
}

export interface FormWizardProps {
  steps: WizardStep[];
  mode?: 'stepper' | 'one-question';
  onComplete?: () => void;
  onStepChange?: (index: number) => void;
  className?: string;
}

export function FormWizard({
  steps,
  mode = 'stepper',
  onComplete,
  onStepChange,
  className,
}: FormWizardProps) {
  const [index, setIndex] = useState(0);
  const last = steps.length - 1;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    setIndex(clamped);
    onStepChange?.(clamped);
  };

  return (
    <div className={cn('w-full', className)}>
      {mode === 'stepper' ? (
        <ol className="mb-5 flex items-center gap-2">
          {steps.map((step, i) => (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
                  i < index
                    ? 'bg-success text-accent-ink'
                    : i === index
                      ? 'bg-accent text-accent-ink'
                      : 'bg-surface-1 text-ink-3',
                )}
              >
                {i < index ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm sm:block',
                  i === index ? 'font-medium text-ink' : 'text-ink-3',
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-line/40" />}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          Question {index + 1} of {steps.length}
        </p>
      )}

      <div className="mb-5" aria-live="polite">
        {mode === 'one-question' && (
          <h3 className="mb-2 text-lg font-medium text-ink">{steps[index]?.label}</h3>
        )}
        {steps[index]?.content}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-1 disabled:opacity-40',
            focusRing(),
          )}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (index === last ? onComplete?.() : go(index + 1))}
          className={cn(
            'mat-primary inline-flex items-center gap-1.5 rounded-control px-4 py-1.5 text-sm text-accent-ink active:scale-[var(--press-scale)]',
            focusRing(),
          )}
        >
          {index === last ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export interface FormTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabbedFormProps {
  tabs: FormTab[];
  onTabChange?: (id: string) => void;
  className?: string;
}

export function TabbedForm({ tabs, onTabChange, className }: TabbedFormProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className={cn('w-full', className)}>
      <div
        role="toolbar"
        aria-label="Form sections"
        className="mb-4 flex gap-1 border-b border-line/30"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === active}
            onClick={() => {
              setActive(tab.id);
              onTabChange?.(tab.id);
            }}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-skin ease-skin',
              tab.id === active
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-3 hover:text-ink',
              focusRing(),
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current?.content}
    </div>
  );
}

export interface ConditionalFieldProps {
  show?: boolean;
  children: ReactNode;
  className?: string;
}

export function ConditionalField({ show = false, children, className }: ConditionalFieldProps) {
  if (!show) return null;
  return <div className={cn(className)}>{children}</div>;
}

export interface FieldArrayProps<T> {
  values: T[];
  renderItem: (value: T, index: number) => ReactNode;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  addLabel?: string;
  label?: string;
  className?: string;
}

export function FieldArray<T>({
  values,
  renderItem,
  onAdd,
  onRemove,
  addLabel = 'Add',
  label = 'Items',
  className,
}: FieldArrayProps<T>) {
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0 flex flex-col gap-3', className)}
      aria-label={label}
    >
      {values.map((value, index) => (
        <div key={index} className="flex items-end gap-2">
          <div className="min-w-0 flex-1">{renderItem(value, index)}</div>
          <button
            type="button"
            aria-label={`Remove ${label} ${index + 1}`}
            onClick={() => onRemove?.(index)}
            className={cn(
              'mb-0.5 shrink-0 rounded-control p-2 text-ink-4 hover:text-danger',
              focusRing(),
            )}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd?.()}
        className={cn(
          'inline-flex w-fit items-center gap-1.5 rounded-control px-3 py-1.5 text-sm text-accent hover:bg-surface-1',
          focusRing(),
        )}
      >
        <Plus className="size-4" aria-hidden />
        {addLabel}
      </button>
    </fieldset>
  );
}
