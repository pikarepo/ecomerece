/** @jsxImportSource react */

/**
 * Steppers (todo/09 batch 73): page/progress dots, numbered steps
 * (horizontal + vertical, clickable) and a timeline stepper.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 * Distinct from `StepperSlider` (numeric value +/-) and `Timeline`
 * (display-only history): these are navigation/progress indicators.
 */

import { Fragment, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** Status of step `i` for a 0-based `value`: before = complete, at = current. */
export function stepStatus(i: number, value: number, errorAt?: number): StepStatus {
  if (errorAt === i) return 'error';
  if (i < value) return 'complete';
  if (i === value) return 'current';
  return 'upcoming';
}

const STATUS_RING: Record<StepStatus, string> = {
  complete: 'bg-accent border-accent text-accent-ink',
  current: 'bg-surface-1 border-accent text-accent',
  error: 'bg-danger border-danger text-accent-ink',
  upcoming: 'bg-surface-1 border-line/30 text-ink-3',
};

const STATUS_CONNECTOR: Record<StepStatus, string> = {
  complete: 'bg-accent',
  current: 'bg-line/20',
  error: 'bg-danger/50',
  upcoming: 'bg-line/20',
};

/* ── Progress / page dots ─────────────────────────────────────────────── */

export interface ProgressDotsProps {
  /** Number of dots. */
  count: number;
  /** Active index (0-based). */
  value: number;
  /** When provided the dots become buttons (`aria-label="Go to …"`). */
  onChange?: (index: number) => void;
  /** Accessible group name, e.g. "Pages". Default "Pages". */
  label?: string;
  /** How the active dot is announced when not interactive. */
  itemLabel?: (index: number, active: boolean) => string;
  className?: string;
}

/**
 * Carousel-style page dots — active dot stretches into a pill
 * (transform-only; colour stays in tokens).
 */
export function ProgressDots({
  count,
  value,
  onChange,
  label = 'Pages',
  itemLabel,
  className,
}: ProgressDotsProps) {
  const items = Array.from({ length: Math.max(count, 0) }, (_, i) => i);
  return (
    <ul
      role={onChange ? 'list' : 'group'}
      aria-label={label}
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      {items.map((i) => {
        const active = i === value;
        const name = itemLabel
          ? itemLabel(i, active)
          : onChange
            ? `Go to page ${i + 1}`
            : `Page ${i + 1}`;
        const dot = (
          <span
            aria-hidden
            className={cn(
              'block h-2 rounded-full transition-all duration-skin ease-skin',
              active ? 'w-6 bg-accent' : 'w-2 bg-line/30',
            )}
          />
        );
        return (
          <li key={i} aria-current={active ? 'step' : undefined} className="flex">
            {onChange ? (
              <button
                type="button"
                aria-label={name}
                aria-current={active ? 'step' : undefined}
                onClick={() => onChange(i)}
                className={cn('grid place-items-center rounded-full p-1', focusRing())}
              >
                {dot}
              </button>
            ) : (
              <span
                role="img"
                aria-label={name}
                title={name}
                className="grid place-items-center p-1"
              >
                {dot}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Numbered stepper ─────────────────────────────────────────────────── */

export interface StepItem {
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface StepperProps {
  steps: StepItem[];
  /** 0-based index of the active step. */
  value: number;
  /** Providing it makes steps clickable (skip `disabled`). */
  onChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  /** Index rendered as an error state (overrides complete/current). */
  errorAt?: number;
  className?: string;
}

/**
 * Numbered steps with connector rails. Steps before `value` show a check,
 * the active one is ringed with `aria-current="step"`; connectors turn
 * accent-coloured behind completed steps.
 */
export function Stepper({
  steps,
  value,
  onChange,
  orientation = 'horizontal',
  errorAt,
  className,
}: StepperProps) {
  const vertical = orientation === 'vertical';
  return (
    <ol
      aria-label="Steps"
      className={cn(vertical ? 'flex flex-col' : 'flex flex-row items-start', className)}
    >
      {steps.map((step, i) => {
        const status = stepStatus(i, value, errorAt);
        const active = status === 'current';
        const clickable = Boolean(onChange) && !step.disabled && status !== 'upcoming';
        const isLast = i === steps.length - 1;

        const circle = (
          <span
            aria-hidden
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
              'transition-colors duration-skin ease-skin',
              STATUS_RING[status],
            )}
          >
            {status === 'complete' ? '✓' : status === 'error' ? '!' : i + 1}
          </span>
        );

        return (
          <Fragment key={i}>
            <li
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex gap-3',
                vertical ? 'pb-4' : 'min-w-0 max-w-52 flex-col items-center text-center',
              )}
            >
              {clickable ? (
                <button
                  type="button"
                  aria-label={`Step ${i + 1}: ${typeof step.label === 'string' ? step.label : ''}`}
                  onClick={() => onChange?.(i)}
                  disabled={step.disabled}
                  className={cn(
                    'rounded-full transition-transform duration-skin ease-skin active:scale-95',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    focusRing(),
                  )}
                >
                  {circle}
                </button>
              ) : (
                circle
              )}
              <div className={cn('min-w-0', vertical && 'pt-1')}>
                <div
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-ink' : status === 'upcoming' ? 'text-ink-3' : 'text-ink-2',
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-0.5 text-xs leading-snug text-ink-3">{step.description}</div>
                )}
              </div>
            </li>
            {!isLast && (
              <li
                aria-hidden
                className={cn(
                  'shrink-0',
                  STATUS_CONNECTOR[
                    stepStatus(i + 1, value, errorAt) === 'upcoming' ? 'upcoming' : 'complete'
                  ],
                  vertical
                    ? 'mb-2 ml-[15px] w-0.5 self-start'
                    : 'mx-2 mt-4 h-0.5 min-w-6 flex-1 first:rounded-full last:rounded-full',
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

/* ── Timeline stepper ─────────────────────────────────────────────────── */

export interface TimelineStep {
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  disabled?: boolean;
}

export interface TimelineStepperProps {
  steps: TimelineStep[];
  value: number;
  onChange?: (index: number) => void;
  /** Index rendered as an error state. */
  errorAt?: number;
  className?: string;
}

/**
 * Vertical stepper laid out like a travel log: rail on the left with
 * status markers (✓ / number), timestamps right-aligned, descriptions under
 * each title. Titles become buttons when `onChange` is provided.
 */
export function TimelineStepper({
  steps,
  value,
  onChange,
  errorAt,
  className,
}: TimelineStepperProps) {
  return (
    <ol aria-label="Steps" className={cn('flex flex-col', className)}>
      {steps.map((step, i) => {
        const status = stepStatus(i, value, errorAt);
        const active = status === 'current';
        const isLast = i === steps.length - 1;
        const clickable = Boolean(onChange) && !step.disabled;

        const marker = (
          <span
            aria-hidden
            className={cn(
              'relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold',
              'transition-colors duration-skin ease-skin ring-4 ring-surface-1',
              STATUS_RING[status],
            )}
          >
            {status === 'complete' ? '✓' : status === 'error' ? '!' : i + 1}
          </span>
        );

        return (
          <li
            key={i}
            aria-current={active ? 'step' : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-7 -bottom-1 w-0.5 rounded-full',
                  i + 1 <= value || errorAt === i + 1
                    ? STATUS_CONNECTOR[stepStatus(i + 1, value, errorAt)]
                    : 'bg-line/15',
                )}
              />
            )}
            <div className="relative flex h-7 shrink-0 items-center">{marker}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                {clickable ? (
                  <button
                    type="button"
                    disabled={step.disabled}
                    onClick={() => onChange?.(i)}
                    className={cn(
                      'min-w-0 rounded-control text-left text-sm font-semibold text-ink',
                      'transition-colors duration-skin ease-skin hover:text-accent',
                      'disabled:cursor-not-allowed disabled:text-ink-4',
                      focusRing(),
                    )}
                  >
                    {step.title}
                  </button>
                ) : (
                  <p className="min-w-0 text-sm font-semibold text-ink">{step.title}</p>
                )}
                {step.timestamp && (
                  <span className="shrink-0 text-xs text-ink-3">{step.timestamp}</span>
                )}
              </div>
              {step.description && <p className="mt-0.5 text-sm text-ink-3">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
