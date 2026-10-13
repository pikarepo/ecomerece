// wizard.store.ts
import { create } from 'zustand';

interface WizardState {
  wizardStep: number;
  wizardTotalSteps: number;
  wizardData: Record<string, unknown>;

  setWizardStep: (step: number | ((prev: number) => number)) => void;
  setWizardTotalSteps: (total: number) => void;
  setWizardData: (data: Record<string, unknown>) => void;
  resetWizard: () => void;
}

/**
 * Multi-step flow state (onboarding, checkout, setup wizards).
 *
 * `wizardData` can grow large and change on nearly every field edit; keeping
 * it in its own store means that churn never touches the sidebar, tabs, or
 * command palette.
 */
export const useWizardStore = create<WizardState>()((set) => ({
  wizardStep: 1,
  wizardTotalSteps: 1,
  wizardData: {},

  setWizardStep: (step) =>
    set((state) => ({
      wizardStep: typeof step === 'function' ? step(state.wizardStep) : step,
    })),

  setWizardTotalSteps: (wizardTotalSteps) => set({ wizardTotalSteps }),

  setWizardData: (data) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    })),

  resetWizard: () => set({ wizardStep: 1, wizardData: {} }),
}));
