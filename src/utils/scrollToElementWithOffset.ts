const WIZARD_SCROLL_CONTAINER_SELECTOR = "[data-wizard-scroll-container='true']";

/**
 * Smoothly scrolls so that the top edge of `element` sits
 * `offsetFromBottom` pixels above the visible bottom edge of the
 * wizard scroll container (or the viewport as fallback).
 *
 * Returns `true` when a scroll was initiated, `false` when the element
 * is already in the right position or could not be located.
 */
export function scrollToElementWithOffset(
  element: HTMLElement,
  offsetFromBottom: number,
): boolean {
  const scrollContainer = document.querySelector(
    WIZARD_SCROLL_CONTAINER_SELECTOR,
  ) as HTMLElement | null;

  if (scrollContainer) {
    const buttonRect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetTop = containerRect.bottom - offsetFromBottom;
    const delta = buttonRect.top - targetTop;
    const maxScrollableTop =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;

    const nextTop = Math.min(
      Math.max(scrollContainer.scrollTop + delta, 0),
      maxScrollableTop,
    );

    const canContainerScroll = maxScrollableTop > 0;
    const containerWillMove =
      canContainerScroll && Math.abs(nextTop - scrollContainer.scrollTop) > 1;

    if (containerWillMove) {
      scrollContainer.scrollTo({ top: nextTop, behavior: "smooth" });
      return true;
    }
  }

  const buttonRect = element.getBoundingClientRect();
  const targetTop = window.innerHeight - offsetFromBottom;
  const delta = buttonRect.top - targetTop;
  const nextWindowTop = Math.max(window.scrollY + delta, 0);
  const windowWillMove = Math.abs(nextWindowTop - window.scrollY) > 1;

  if (windowWillMove) {
    window.scrollTo({ top: nextWindowTop, behavior: "smooth" });
    return true;
  }

  element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  return false;
}

/**
 * Polls until `elementId` is found in the DOM then scrolls it into position.
 * Runs a correction pass after the initial scroll settles.
 * Returns a cleanup function that cancels the polling.
 */
export function scrollToIdWithOffset(
  elementId: string,
  offsetFromBottom: number,
): () => void {
  let attempts = 0;
  const maxAttempts = 30;

  const intervalId = window.setInterval(() => {
    attempts += 1;

    const element = document.getElementById(elementId);
    if (!element && attempts < maxAttempts) return;

    window.clearInterval(intervalId);

    if (!element) return;

    const didScroll = scrollToElementWithOffset(element, offsetFromBottom);

    if (didScroll) {
      window.setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) scrollToElementWithOffset(el, offsetFromBottom);
      }, 280);
    }
  }, 120);

  return () => window.clearInterval(intervalId);
}
