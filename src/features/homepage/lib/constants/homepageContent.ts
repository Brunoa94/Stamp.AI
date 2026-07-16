/**
 * Homepage v2 static content
 *
 * Copy is identical to the previous homepage iteration; only the
 * presentation layer changed. Product data is NOT here — it comes from the
 * server cache (getCachedProductsWithPricing).
 */

export const MAX_HOME_PRODUCTS = 8;

// Display copy lives in messages (home.process.steps.<id>); only structural
// fields remain here.
export type HomeProcessStepType = {
  id: string;
  number: string;
};

export const HOME_PROCESS_STEPS: HomeProcessStepType[] = [
  { id: "step-studio", number: "01" },
  { id: "step-synthesis", number: "02" },
  { id: "step-material", number: "03" },
  { id: "step-production", number: "04" },
  { id: "step-quality", number: "05" },
  { id: "step-delivery", number: "06" },
];

// Display copy lives in messages (home.manifesto.values.<number>); the number
// doubles as the stable id.
export type HomeValueCardType = {
  number: string;
};

export const HOME_VALUE_CARDS: HomeValueCardType[] = [
  { number: "01" },
  { number: "02" },
  { number: "03" },
  { number: "04" },
];

export type HomePlatformRatingType = {
  platform: string;
  rating: number;
  reviews: number;
};

export const HOME_RATING_SUMMARY = {
  overall: 4.8,
  totalReviews: 1247,
  platforms: [
    { platform: "Trustpilot", rating: 4.9, reviews: 523 },
    { platform: "Google", rating: 4.8, reviews: 412 },
    { platform: "ProductHunt", rating: 4.7, reviews: 312 },
  ] satisfies HomePlatformRatingType[],
};

// Display copy (author, role, quote) lives in messages
// (home.reviews.testimonials.<id>); only structural fields remain here.
export type HomeTestimonialType = {
  id: string;
  platform: string;
  rating: number;
  helpful: number;
};

export const HOME_TESTIMONIALS: HomeTestimonialType[] = [
  { id: "alex-chen", platform: "Trustpilot", rating: 5, helpful: 127 },
  { id: "jordan-ellis", platform: "Google", rating: 5, helpful: 94 },
  { id: "morgan-park", platform: "ProductHunt", rating: 5, helpful: 156 },
  { id: "riley-santos", platform: "Trustpilot", rating: 5, helpful: 83 },
];

// Display copy (question, answer) lives in messages (home.faq.items.<id>).
export type HomeFaqType = {
  id: string;
};

export const HOME_FAQS: HomeFaqType[] = [
  { id: "ai-synthesis" },
  { id: "archival-quality" },
  { id: "production-shipping" },
  { id: "sustainability" },
  { id: "samples" },
  { id: "satisfaction" },
];

// Values are stable ids resolved to labels in messages
// (home.trustIndicators.items.<id>).
export type HomeTrustIndicatorType = string;

export const HOME_HERO_TRUST: HomeTrustIndicatorType[] = [
  "aiPowered",
  "archivalQuality",
  "instantDelivery",
];

export const HOME_CTA_TRUST: HomeTrustIndicatorType[] = [
  "fiveSevenDayDelivery",
  "thirtyDayGuarantee",
  "carbonNeutral",
];

export type HomePlatformConfigType = {
  color: string;
  bgColor: string;
  borderColor: string;
};

export const HOME_PLATFORM_CONFIG: Record<string, HomePlatformConfigType> = {
  Google: {
    color: "#4285F4",
    bgColor: "rgba(66, 133, 244, 0.08)",
    borderColor: "rgba(66, 133, 244, 0.2)",
  },
  Trustpilot: {
    color: "#00B67A",
    bgColor: "rgba(0, 182, 122, 0.08)",
    borderColor: "rgba(0, 182, 122, 0.2)",
  },
  ProductHunt: {
    color: "#DA552F",
    bgColor: "rgba(218, 85, 47, 0.08)",
    borderColor: "rgba(218, 85, 47, 0.2)",
  },
};
