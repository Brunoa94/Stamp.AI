import { useCallback, useRef, useEffect } from 'react';

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
  // Store active timeout IDs for cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

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
      const timeoutId = setTimeout(() => {
        performScroll();
        timeoutsRef.current.delete(timeoutId);
      }, delay);
      timeoutsRef.current.add(timeoutId);
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
      block = 'start',
      delay = 0,
      offset = 0
    } = options;

    const performSmoothScroll = () => {
      if (ref.current) {
        const element = ref.current;
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;

        let scrollPosition;
        if (block === 'start') {
          // Position at top with offset (navbar height + desired spacing)
          scrollPosition = absoluteElementTop + offset;
        } else {
          // Center positioning
          scrollPosition = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2) + offset;
        }

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        performSmoothScroll();
        timeoutsRef.current.delete(timeoutId);
      }, delay);
      timeoutsRef.current.add(timeoutId);
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
        const timeoutId = setTimeout(() => {
          performScroll();
          timeoutsRef.current.delete(timeoutId);
        }, delay);
        timeoutsRef.current.add(timeoutId);
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
      const timeoutId = setTimeout(() => {
        performScroll();
        timeoutsRef.current.delete(timeoutId);
      }, delay);
      timeoutsRef.current.add(timeoutId);
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