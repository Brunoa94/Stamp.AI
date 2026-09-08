"use client";

import { useEffect } from "react";
import { useStampReset } from "../lib/hooks/useStampSelectors";
import { StampFormProvider } from "../lib/context/StampFormContext";
import { StampCanvas } from "./StampCanvas";

/**
 * StampPage
 *
 * Owns the form context and the cleanup effect only.
 * Navigation/animation is delegated to StampCanvas so that step changes
 * never cause StampFormProvider (and its React Hook Form context) to re-render.
 */
export function StampPage() {
  const { reset } = useStampReset();

  // Reset store state when page unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <StampFormProvider>
      <StampCanvas />
    </StampFormProvider>
  );
}
