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
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { TopTrustBannerItems } from "./TopTrustBannerItems";

/** Ignore the strip behind the fixed header (h-16 below lg, h-24 from lg) when checking visibility */
const MOBILE_HEADER_ROOT_MARGIN = "-64px 0px 0px 0px";
const DESKTOP_HEADER_ROOT_MARGIN = "-96px 0px 0px 0px";

export function TopTrustBanner() {
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: isLgUp ? DESKTOP_HEADER_ROOT_MARGIN : MOBILE_HEADER_ROOT_MARGIN,
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
