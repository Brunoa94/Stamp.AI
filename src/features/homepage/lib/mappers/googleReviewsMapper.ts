import type {
  GooglePlaceT,
  GoogleReviewT,
  GoogleReviewsSummaryT,
} from "../types/googleReviews";

/** The section lays reviews out two by two; Google sends up to five */
const MAX_GOOGLE_REVIEWS = 4;
const GOOGLE_PHOTO_HOST = "lh3.googleusercontent.com";

const mapReview = (
  review: NonNullable<GooglePlaceT["reviews"]>[number],
): GoogleReviewT | null => {
  const text = review.text?.text?.trim();
  if (!text || !review.name || !review.rating) return null;

  return {
    id: review.name,
    authorName: review.authorAttribution?.displayName || null,
    authorUrl: review.authorAttribution?.uri || null,
    authorPhotoUrl: allowedPhotoUrl(review.authorAttribution?.photoUri),
    rating: review.rating,
    text,
    relativeTime: review.relativePublishTimeDescription || null,
  };
};

/** next/image only loads the host listed in next.config.ts remotePatterns */
const allowedPhotoUrl = (photoUri: string | undefined): string | null => {
  if (!photoUri || !URL.canParse(photoUri)) return null;
  const url = new URL(photoUri);

  return url.protocol === "https:" && url.hostname === GOOGLE_PHOTO_HOST ? photoUri : null;
};

/**
 * Turns a Place Details response into what the homepage renders. Returns
 * null when there is nothing honest to show (no rating yet, or no review
 * with text), so the section stays hidden instead of showing an empty card.
 */
export function mapPlaceToGoogleReviews(
  place: GooglePlaceT,
  placeId: string,
): GoogleReviewsSummaryT | null {
  if (!place.rating || !place.userRatingCount) return null;

  const reviews = (place.reviews ?? [])
    .map(mapReview)
    .filter((review): review is GoogleReviewT => review !== null)
    .slice(0, MAX_GOOGLE_REVIEWS);
  if (reviews.length === 0) return null;

  const encodedId = encodeURIComponent(placeId);

  return {
    rating: place.rating,
    totalReviews: place.userRatingCount,
    profileUrl:
      place.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${encodedId}`,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${encodedId}`,
    reviews,
  };
}
