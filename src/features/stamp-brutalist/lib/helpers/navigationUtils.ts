/**
 * Navigation utilities for Stamp Brutalist feature
 * Handles smooth scrolling and step navigation
 */

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

/**
 * Checks if the current viewport is mobile size
 * @returns {boolean} True if viewport width is below mobile breakpoint
 */
export function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Scrolls to a specific step section with smooth behavior (mobile only)
 * @param step - The step number to scroll to
 */
export function scrollToStep(step: number): void {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    if (isMobileViewport()) {
      const section = document.getElementById(`step-${step}`);
      section?.scrollIntoView({ behavior: "smooth" });
    }
  });
}
