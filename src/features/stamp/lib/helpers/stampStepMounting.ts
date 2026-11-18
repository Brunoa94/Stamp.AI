/**
 * Which flow steps StampCanvas renders: every step already visited (so local
 * state survives moving back and forth) plus the active step's neighbours (so
 * a slide in either direction lands on a rendered step). The rest stay as
 * empty placeholders, so a first visit doesn't render, hydrate or download
 * images for the whole flow, and steps whose layout depends on the viewport
 * (useMediaQuery) mount on the client already knowing it.
 */
export function getMountedStampSteps(
  activeStep: number,
  visitedSteps: ReadonlySet<number>,
  stepCount: number,
): Set<number> {
  const mounted = new Set(visitedSteps);
  for (const step of [activeStep - 1, activeStep, activeStep + 1]) {
    if (step >= 0 && step < stepCount) mounted.add(step);
  }
  return mounted;
}
