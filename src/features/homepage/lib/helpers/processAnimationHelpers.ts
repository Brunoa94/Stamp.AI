/**
 * Process Animation Helpers
 *
 * Computes animation values for individual process steps.
 * Keeps complex logic out of JSX return statements.
 */

// Desktop Image Animation Data
export interface DesktopImageAnimationData {
  translateY: number;
  opacity: number;
  zIndex: number;
}

export function computeDesktopImageAnimation(
  index: number,
  activeStepIndex: number,
  stepProgress: number
): DesktopImageAnimationData {
  const isActive = index === activeStepIndex;
  const isPast = index < activeStepIndex;
  const isFuture = index > activeStepIndex;

  let translateY = 0;
  let opacity = 1;
  let zIndex = 1;

  if (isPast) {
    translateY = -80;
    opacity = 0;
    zIndex = 0;
  } else if (isFuture) {
    const distanceFromActive = index - activeStepIndex;
    if (distanceFromActive === 1) {
      translateY = 80 * (1 - stepProgress);
      opacity = stepProgress;
      zIndex = 1;
    } else {
      translateY = 80;
      opacity = 0;
      zIndex = 0;
    }
  } else if (isActive) {
    translateY = -80 * stepProgress;
    opacity = 1 - stepProgress;
    zIndex = 2;
  }

  return { translateY, opacity, zIndex };
}

// Mobile Card Animation Data
export interface MobileCardAnimationData {
  translateY: number;
  opacity: number;
  scale: number;
  isActive: boolean;
  isVisible: boolean;
}

export function computeMobileCardAnimation(
  index: number,
  activeStepIndex: number,
  stepProgress: number
): MobileCardAnimationData {
  const stepHeight = 380;
  const centerOffset = 30;
  const isActive = index === activeStepIndex;

  const baseOffset = (index - activeStepIndex) * stepHeight;
  const scrollOffset = -stepProgress * stepHeight;
  const translateY = centerOffset + baseOffset + scrollOffset;

  let opacity = 0;
  if (isActive) {
    opacity = 1;
  } else if (index === activeStepIndex + 1) {
    opacity = 0.3 + stepProgress * 0.7;
  } else if (index === activeStepIndex - 1) {
    opacity = 0.3;
  }

  const scale = isActive ? 1 : 0.92;
  const isVisible = Math.abs(index - activeStepIndex) <= 1;

  return { translateY, opacity, scale, isActive, isVisible };
}

// Desktop Text Animation Data
export interface DesktopTextAnimationData {
  translateY: number;
  opacity: number;
  isActive: boolean;
  isVisible: boolean;
}

export function computeDesktopTextAnimation(
  index: number,
  activeStepIndex: number,
  stepProgress: number
): DesktopTextAnimationData {
  const centerOffset = 150;
  const stepOffset = 280;
  const isActive = index === activeStepIndex;

  const baseOffset = (index - activeStepIndex) * stepOffset;
  const scrollOffset = -stepProgress * stepOffset;
  const translateY = centerOffset + baseOffset + scrollOffset;

  let opacity = 0;
  if (isActive) {
    opacity = 1;
  } else if (index === activeStepIndex + 1) {
    opacity = 0.4 + stepProgress * 0.6;
  } else if (index === activeStepIndex - 1) {
    opacity = 0.3;
  }

  const isVisible = Math.abs(index - activeStepIndex) <= 1;

  return { translateY, opacity, isActive, isVisible };
}
