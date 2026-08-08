import { useCallback, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMobileStepActionStore } from "../stores/mobileStepActionStore";
import { useStampNavigation } from "./useStampNavigation";

/**
 * useMobileStepAction
 *
 * Hook to get the current mobile step action state.
 * Used by MobileStepFooter to render the primary action button.
 */
export function useMobileStepAction() {
  const { currentStep } = useStampNavigation();
  const actions = useMobileStepActionStore((state) => state.actions);

  const currentAction = actions.get(currentStep);

  return {
    action: currentAction?.action ?? null,
    label: currentAction?.label ?? null,
    disabled: currentAction?.disabled ?? false,
    loading: currentAction?.loading ?? false,
  };
}

/**
 * useRegisterMobileAction
 *
 * Hook for step components to register their primary action
 * for display in the mobile sticky footer.
 *
 * Only registers on mobile (<md breakpoint). On desktop, this is a no-op
 * to avoid unnecessary store updates.
 *
 * @param stepIndex - The step index this action belongs to (0-8)
 * @param config - Action configuration
 *
 * @example
 * useRegisterMobileAction(1, {
 *   action: handleNext,
 *   label: t("next"),
 *   disabled: !isValid,
 * });
 */
export function useRegisterMobileAction(
  stepIndex: number,
  config: {
    action: () => void;
    label: string;
    disabled?: boolean;
    loading?: boolean;
  },
) {
  // Only register on mobile (below md breakpoint)
  const isMobile = useMediaQuery("(max-width: 767px)", false);

  const registerAction = useMobileStepActionStore(
    (state) => state.registerAction,
  );
  const updateAction = useMobileStepActionStore((state) => state.updateAction);
  const unregisterAction = useMobileStepActionStore(
    (state) => state.unregisterAction,
  );

  // Memoize the action to prevent unnecessary re-registrations
  const memoizedAction = useCallback(config.action, [config.action]);

  // Register action on mount, unregister on unmount (mobile only)
  useEffect(() => {
    if (!isMobile) return;

    registerAction(stepIndex, {
      action: memoizedAction,
      label: config.label,
      disabled: config.disabled ?? false,
      loading: config.loading ?? false,
    });

    return () => {
      unregisterAction(stepIndex);
    };
    // Only re-register when label changes (action ref is stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, stepIndex, config.label, memoizedAction, registerAction, unregisterAction]);

  // Update disabled/loading state separately (more frequent updates, mobile only)
  useEffect(() => {
    if (!isMobile) return;

    updateAction(stepIndex, {
      disabled: config.disabled,
      loading: config.loading,
    });
  }, [isMobile, stepIndex, config.disabled, config.loading, updateAction]);
}
