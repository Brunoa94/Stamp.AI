/**
 * HomeGoogleReviewsSlot
 *
 * Waits for the Google reviews the page started loading and renders the
 * section, or nothing when Google had nothing to show. Rendered inside a
 * Suspense boundary so the rest of the homepage streams without waiting.
 */

import type { GoogleReviewsSummaryT } from "../../../lib/types/googleReviews";
import { HomeGoogleReviewsSection } from "./HomeGoogleReviewsSection";

interface PropsI {
  reviews: Promise<GoogleReviewsSummaryT | null>;
}

export async function HomeGoogleReviewsSlot({ reviews }: PropsI) {
  const summary = await reviews;
  if (!summary) return null;

  return <HomeGoogleReviewsSection summary={summary} />;
}
