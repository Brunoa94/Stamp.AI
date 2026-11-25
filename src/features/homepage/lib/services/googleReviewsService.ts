/**
 * Google Reviews
 *
 * Reads the business's Google rating and up to five reviews from the Places
 * API (New), server side only. Rating and reviews are billed as Place Details
 * Enterprise, which has 1,000 free calls a month; caching the response for a
 * day keeps us at about 30 calls per language a month, well inside it.
 *
 * Needs GOOGLE_PLACES_API_KEY (server-only, restricted to the Places API) and
 * GOOGLE_PLACE_ID. Without them, or when Google fails, it returns null and the
 * homepage hides the section: a missing review strip never breaks the page.
 */

import { createLogger } from "@/lib/observability/logger";
import { mapPlaceToGoogleReviews } from "../mappers/googleReviewsMapper";
import type { GooglePlaceT, GoogleReviewsSummaryT } from "../types/googleReviews";

const PLACES_URL = "https://places.googleapis.com/v1/places";
const FIELD_MASK = "rating,userRatingCount,reviews,googleMapsUri";
/** Google's terms allow caching Places content for up to 30 days; a day keeps it fresh */
const REVALIDATE_S = 60 * 60 * 24;
/** The section is optional: past this, give up and hide it rather than hold the page */
const TIMEOUT_MS = 2000;

const log = createLogger({ service: "google-reviews" });

export async function getGoogleReviews(
  locale: string,
): Promise<GoogleReviewsSummaryT | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${PLACES_URL}/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(locale)}`,
      {
        headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
        next: { revalidate: REVALIDATE_S },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      log.warn("Places API answered with an error", {
        action: "fetch_place_reviews",
        metadata: { status: response.status },
      });
      return null;
    }

    return mapPlaceToGoogleReviews((await response.json()) as GooglePlaceT, placeId);
  } catch (error) {
    log.warn("Places API request failed", {
      action: "fetch_place_reviews",
      error,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
