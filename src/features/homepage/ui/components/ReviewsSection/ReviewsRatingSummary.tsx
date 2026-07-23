/**
 * ReviewsRatingSummary
 *
 * Overall rating card with platform breakdown.
 */

import { Span } from "@/features/ui/span";
import {
  HOME_RATING_SUMMARY,
  HOME_PLATFORM_CONFIG,
} from "../../../lib/constants/homepageContent";
import { HomeRatingStars } from "../HomeRatingStars";
import { ReviewsPlatformBadge } from "./ReviewsPlatformBadge";

export function ReviewsRatingSummary() {
  return (
    <article className="border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 sm:p-10 lg:col-span-4">
      <Span variant="metric" className="text-(--color-stamp-chocolate)">
        {HOME_RATING_SUMMARY.overall}
      </Span>
      <HomeRatingStars rating={HOME_RATING_SUMMARY.overall} className="mt-4" />
      <Span as="p" variant="micro" className="mt-3 text-(--color-stamp-taupe)">
        {HOME_RATING_SUMMARY.totalReviews.toLocaleString()} Verified Reviews
      </Span>

      <div className="mt-10 space-y-4 border-t border-(--color-stamp-divider) pt-8">
        {HOME_RATING_SUMMARY.platforms.map((entry) => {
          const config = HOME_PLATFORM_CONFIG[entry.platform];
          return (
            <div
              key={entry.platform}
              className="flex items-center justify-between rounded-sm px-3 py-2 transition-colors duration-200"
              style={{
                backgroundColor: config?.bgColor ?? "transparent",
                borderLeft: `3px solid ${config?.borderColor ?? "transparent"}`,
              }}
            >
              <ReviewsPlatformBadge platform={entry.platform} variant="inline" />
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {entry.rating} · {entry.reviews}
              </Span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
