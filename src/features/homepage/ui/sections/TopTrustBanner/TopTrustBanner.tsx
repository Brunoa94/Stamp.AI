/**
 * TopTrustBanner
 *
 * Dark banner right below the navbar displaying key trust indicators.
 * Similar to AboutYou's top banner with shipping, returns, and payment info.
 * Below lg it opens the page and runs up behind the transparent h-16 header,
 * so the header starts on a dark surface; from lg it sits in the page flow
 * under the h-24 header. Its labels fall in from the top one after another
 * whenever the banner scrolls into view.
 */

"use client";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import { TopTrustBannerItems } from "./TopTrustBannerItems";

/** Ignore the strip behind the fixed mobile (h-16) header when checking visibility */
const HEADER_ROOT_MARGIN = "-64px 0px 0px 0px";

export function TopTrustBanner() {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: HEADER_ROOT_MARGIN,
    triggerOnce: false,
  });

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden bg-(--color-stamp-chocolate) pt-18.5 pb-2.5 lg:mt-26 lg:pt-2.5"
    >
      <TopTrustBannerItems isDropped={isVisible} />
    </div>
  );
}
