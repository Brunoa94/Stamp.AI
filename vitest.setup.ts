import "@testing-library/jest-dom";

/**
 * jsdom polyfills for Radix UI primitives.
 *
 * Radix (Select, Dropdown, ...) uses Pointer Events APIs and scrollIntoView
 * that jsdom does not implement, which otherwise throws when a test opens
 * one of those components.
 */
if (typeof window !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
