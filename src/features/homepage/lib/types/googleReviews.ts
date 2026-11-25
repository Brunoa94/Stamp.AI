/** The subset of a Places API (New) Place Details response we request */
export type GooglePlaceT = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlaceReviewT[];
};

type GooglePlaceReviewT = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

/** One Google review, ready to render */
export type GoogleReviewT = {
  id: string;
  /** Null when Google has no display name; the UI shows a translated fallback */
  authorName: string | null;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  /** Google's own wording, already in the requested language ("2 weeks ago") */
  relativeTime: string | null;
};

/** The business's Google rating and the reviews Google picked as most relevant */
export type GoogleReviewsSummaryT = {
  rating: number;
  totalReviews: number;
  profileUrl: string;
  writeReviewUrl: string;
  reviews: GoogleReviewT[];
};
