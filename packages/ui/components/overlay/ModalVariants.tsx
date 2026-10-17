/** @jsxImportSource react */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '../controls/Button';
import { ProgressDots } from '../navigation/Stepper';
import { Modal } from './Modal';

/**
 * Modal variants (todo/09 §G batch 93). Size/fullscreen/scrollable/side/
 * stacked-nested live as additive props on the baseline `Modal`; this file
 * adds the `WizardDialog` (stepped dialog reusing `Modal` + batch-73
 * `ProgressDots`).
 */

export interface ModalWizardStep {
  id: string;
  /** Step heading shown above the body. */
  title?: string;
  content: ReactNode;
}

/** Clamp a step index into `[0, count - 1]` (0 when there are no steps). */
export function clampStep(step: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(step, 0), count - 1);
}

export interface WizardDialogProps {
  open: boolean;
  onClose: () => void;
  steps: ModalWizardStep[];
  /** Controlled active step (0-based); omit to let the dialog manage it. */
  step?: number;
  /** Starting step for the uncontrolled mode. Default 0. */
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** String titles become the dialog's accessible name — keep one. */
  title?: ReactNode;
  description?: ReactNode;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  /** Fired by Finish on the last step; the owner decides whether to close. */
  onFinish?: () => void;
  className?: string;
}

/**
 * Stepped wizard dialog (todo/09 §G batch 93): Back/Next footer (ends
 * disabled), "Step X of N" + `ProgressDots` header with `aria-current="step"`,
 * controlled (`step` + `onStepChange`) or uncontrolled (`defaultStep`).
 */
export function WizardDialog({
  open,
  onClose,
  steps,
  step,
  defaultStep = 0,
  onStepChange,
  title,
  description,
  nextLabel = 'Next',
  backLabel = 'Back',
  finishLabel = 'Finish',
  onFinish,
  className,
}: WizardDialogProps) {
  const [internalStep, setInternalStep] = useState(defaultStep);
  const controlled = step !== undefined;
  const current = clampStep(controlled ? step : internalStep, steps.length);
  const last = current === steps.length - 1;
  const active = steps[current];

  const go = (next: number) => {
    const clamped = clampStep(next, steps.length);
    if (!controlled) setInternalStep(clamped);
    onStepChange?.(clamped);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      scrollable
      className={className}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={current === 0 || steps.length === 0}
            onClick={() => go(current - 1)}
          >
            {backLabel}
          </Button>
          <Button
            variant="primary"
            disabled={steps.length === 0}
            onClick={() => {
              if (last) onFinish?.();
              else go(current + 1);
            }}
          >
            {last ? finishLabel : nextLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{active?.title ?? title}</p>
          <p className="text-xs text-ink-3">
            Step {current + 1} of {steps.length}
          </p>
        </div>
        <ProgressDots
          count={steps.length}
          value={current}
          label="Wizard steps"
          itemLabel={(i) => `Step ${i + 1}`}
        />
      </div>
      <div className="mt-3">{active?.content}</div>
    </Modal>
  );
}
