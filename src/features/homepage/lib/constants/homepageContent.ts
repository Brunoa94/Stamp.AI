/**
 * Homepage v2 static content
 *
 * Copy is identical to the previous homepage iteration; only the
 * presentation layer changed. Product data is NOT here — it comes from the
 * server cache (getCachedProductsWithPricing).
 */

export const MAX_HOME_PRODUCTS = 4;

// Process section - stagger delay between card reveals (ms)
export const PROCESS_STAGGER_DELAY_MS = 120;

// Trust guarantees section - stagger delay between card reveals (ms)
export const TRUST_GUARANTEES_STAGGER_DELAY_MS = 100;

// Hero showcase - the same subject rendered in different AI styles, cycled
// as a live print on the hero garment. Labels live in messages
// (home.hero.showcase.styles.<id>).
export type HeroShowcaseStyleType = {
  id: string;
  src: string;
};

export const HERO_SHOWCASE_STYLES: HeroShowcaseStyleType[] = [
  { id: "watercolor", src: "/suggested-edits/watercolor.png" },
  { id: "pop-art", src: "/suggested-edits/pop-art.png" },
  { id: "neon", src: "/suggested-edits/neon.png" },
  { id: "sketch", src: "/suggested-edits/sketch.png" },
  { id: "oil-paint", src: "/suggested-edits/oil-paint.png" },
  { id: "vintage", src: "/suggested-edits/vintage.png" },
];

export const HERO_SHOWCASE_GARMENT = "/home/1-a.png";

// Interval between style swaps on the hero garment (ms)
export const HERO_SHOWCASE_INTERVAL_MS = 2800;

// The artwork previews share this intrinsic aspect ratio (width / height)
export const HERO_SHOWCASE_ART_ASPECT = "929 / 1152";

// Values are stable ids resolved to labels in messages
// (home.hero.highlights.<id>).
export const HOME_HERO_HIGHLIGHTS: string[] = [
  "noSkills",
  "madeToOrder",
  "shipping",
  "guarantee",
];

// Story section - alternating image + text splits. Display copy lives in
// messages (home.story.blocks.<id>); a block with multiple images renders
// them as a collage.
export type HomeStoryBlockType = {
  id: string;
  images: string[];
  imagePosition: "left" | "right";
  href: string;
};

export const HOME_STORY_BLOCKS: HomeStoryBlockType[] = [
  {
    id: "design",
    images: [
      "/suggested-edits/golden-hour.png",
      "/suggested-edits/line-art.png",
      "/suggested-edits/minimal.png",
      "/suggested-edits/film-grain.png",
    ],
    imagePosition: "right",
    href: "/stamp",
  },
  {
    id: "quality",
    images: ["/home/3-a.png"],
    imagePosition: "left",
    href: "#products",
  },
  {
    id: "planet",
    images: ["/home/6-a.png"],
    imagePosition: "right",
    href: "#process",
  },
];

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

// Alternating color styles for process step cards
export type ProcessStepColorType = {
  border: string;
  text: string;
};

export const PROCESS_STEP_COLORS: ProcessStepColorType[] = [
  {
    border: "hover:border-(--color-stamp-gold)",
    text: "group-hover:text-(--color-stamp-gold)",
  },
  {
    border: "hover:border-(--color-stamp-chocolate)",
    text: "group-hover:text-(--color-stamp-chocolate)",
  },
  {
    border: "hover:border-(--color-stamp-taupe)",
    text: "group-hover:text-(--color-stamp-taupe)",
  },
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

// Display copy lives in messages (home.guarantees.items.<id>).
// Icons are lucide-react icon names.
export type HomeTrustGuaranteeType = {
  id: string;
  icon: string;
};

export const HOME_TRUST_GUARANTEES: HomeTrustGuaranteeType[] = [
  { id: "returns", icon: "RotateCcw" },
  { id: "refund", icon: "ShieldCheck" },
  { id: "securePayment", icon: "Lock" },
  { id: "freeShipping", icon: "Truck" },
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
