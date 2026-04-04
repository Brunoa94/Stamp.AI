import { useEffect, useRef, useState } from "react";

export function usePromoCarouselOverflow(isLoading: boolean, dependencyKey: string) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) {
      return;
    }

    const measure = () => {
      setShouldAnimate(track.scrollWidth > viewport.clientWidth);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [isLoading, dependencyKey]);

  return {
    viewportRef,
    trackRef,
    shouldAnimate,
  };
}
