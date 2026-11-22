/**
 * Process Carousel Helpers
 *
 * Scroll math for "The Process" horizontal carousel: the section is pinned
 * while the page scrolls through it, and that vertical scroll drives the
 * slide track sideways. Kept out of the components so the JSX only renders.
 */

interface ProcessCarouselLayoutI {
  /** How far the page has scrolled into the section (px; negative before it) */
  scrolled: number;
  /** Section height minus the viewport height: the scroll that drives the track */
  scrollable: number;
  slideCount: number;
  /** Full width of the slide track */
  trackWidth: number;
  /** Width of the visible area the track slides through */
  viewportWidth: number;
}

export interface ProcessCarouselFrameT {
  /** 0 at the first slide, 1 at the last */
  progress: number;
  activeIndex: number;
  /** Horizontal offset of the track (px, 0 or negative) */
  translateX: number;
}

export interface ProcessSlideEmphasisT {
  opacity: number;
  scale: number;
}

const RESTING_OPACITY = 0.55;
const RESTING_SCALE = 0.94;

export function getProcessCarouselFrame({
  scrolled,
  scrollable,
  slideCount,
  trackWidth,
  viewportWidth,
}: ProcessCarouselLayoutI): ProcessCarouselFrameT {
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrolled / scrollable)) : 0;
  const overflow = Math.max(0, trackWidth - viewportWidth);
  const lastIndex = Math.max(0, slideCount - 1);

  return {
    progress,
    activeIndex: Math.min(lastIndex, Math.round(progress * lastIndex)),
    // `|| 0` keeps a resting track at 0 rather than -0
    translateX: -progress * overflow || 0,
  };
}

/**
 * How prominent a slide is: full size and opacity under the scroll position,
 * easing down to a resting minimum one slide away and beyond.
 */
export function getProcessSlideEmphasis(
  index: number,
  progress: number,
  slideCount: number,
): ProcessSlideEmphasisT {
  const position = progress * Math.max(0, slideCount - 1);
  const distance = Math.min(1, Math.abs(index - position));

  return {
    opacity: 1 - distance * (1 - RESTING_OPACITY),
    scale: 1 - distance * (1 - RESTING_SCALE),
  };
}
