import { useCallback } from 'react';

interface IScrollOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  delay?: number;
  offset?: number;
}

/**
 * Global hook for smooth scrolling to sections
 * Can be used throughout the application for consistent scroll behavior
 */
const useScrollToSection = () => {
  const scrollToSection = useCallback((
    ref: React.RefObject<HTMLElement | null>,
    options: IScrollOptions = {}
  ) => {
    const {
      behavior = 'smooth',
      block = 'center',
      inline = 'nearest',
      delay = 0
    } = options;

    const performScroll = () => {
      if (ref.current) {
        // Add a small buffer to account for any layout shifts
        requestAnimationFrame(() => {
          ref.current?.scrollIntoView({
            behavior,
            block,
            inline
          });
        });
      }
    };

    if (delay > 0) {
      setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  }, []);

  // Enhanced scroll with custom easing and offset support
  const smoothScrollToSection = useCallback((
    ref: React.RefObject<HTMLElement | null>,
    options: IScrollOptions = {}
  ) => {
    const {
      block = 'center',
      delay = 0,
      offset = 0
    } = options;

    const performSmoothScroll = () => {
      if (ref.current) {
        const element = ref.current;
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2) + offset;

        window.scrollTo({
          top: middle,
          behavior: 'smooth'
        });
      }
    };

    if (delay > 0) {
      setTimeout(performSmoothScroll, delay);
    } else {
      requestAnimationFrame(performSmoothScroll);
    }
  }, []);

  // Scroll to element by ID
  const scrollToElementById = useCallback((
    elementId: string,
    options: IScrollOptions = {}
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      const {
        behavior = 'smooth',
        block = 'center',
        inline = 'nearest',
        delay = 0
      } = options;

      const performScroll = () => {
        requestAnimationFrame(() => {
          element.scrollIntoView({
            behavior,
            block,
            inline
          });
        });
      };

      if (delay > 0) {
        setTimeout(performScroll, delay);
      } else {
        performScroll();
      }
    }
  }, []);

  // Scroll to top of page
  const scrollToTop = useCallback((options: Pick<IScrollOptions, 'behavior' | 'delay'> = {}) => {
    const { behavior = 'smooth', delay = 0 } = options;

    const performScroll = () => {
      window.scrollTo({
        top: 0,
        behavior
      });
    };

    if (delay > 0) {
      setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  }, []);

  return {
    scrollToSection,
    smoothScrollToSection,
    scrollToElementById,
    scrollToTop
  };
};

export default useScrollToSection;