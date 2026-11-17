import type { ReactNode } from "react";

interface PropsI {
  isMounted: boolean;
  children: ReactNode;
}

/**
 * StampStepSlot
 *
 * One step's place in the stamp canvas slider: the step itself once it's
 * mounted (see useMountedStampSteps), otherwise an empty slide of the same
 * height so the slider's offsets stay right.
 */
export function StampStepSlot({ isMounted, children }: PropsI) {
  if (!isMounted) return <div aria-hidden="true" className="h-full" />;

  return children;
}
