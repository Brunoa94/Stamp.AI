import { create } from "zustand";

/**
 * Mobile Step Action Store
 *
 * Lightweight store for managing the primary action buttons
 * displayed in the mobile sticky footer.
 *
 * Each step registers its action with its step index.
 * The footer displays the action for the current step.
 */

interface StepAction {
  action: () => void;
  label: string;
  disabled: boolean;
  loading: boolean;
}

interface MobileStepActionState {
  /** Map of step index to action config */
  actions: Map<number, StepAction>;
  /** Register an action for a specific step */
  registerAction: (stepIndex: number, config: StepAction) => void;
  /** Update an action for a specific step */
  updateAction: (stepIndex: number, updates: Partial<Omit<StepAction, "action">>) => void;
  /** Unregister an action for a specific step */
  unregisterAction: (stepIndex: number) => void;
}

export const useMobileStepActionStore = create<MobileStepActionState>(
  (set) => ({
    actions: new Map(),

    registerAction: (stepIndex, config) => {
      set((state) => {
        const newActions = new Map(state.actions);
        newActions.set(stepIndex, config);
        return { actions: newActions };
      });
    },

    updateAction: (stepIndex, updates) => {
      set((state) => {
        const existing = state.actions.get(stepIndex);
        if (!existing) return state;

        const newActions = new Map(state.actions);
        newActions.set(stepIndex, { ...existing, ...updates });
        return { actions: newActions };
      });
    },

    unregisterAction: (stepIndex) => {
      set((state) => {
        const newActions = new Map(state.actions);
        newActions.delete(stepIndex);
        return { actions: newActions };
      });
    },
  }),
);
