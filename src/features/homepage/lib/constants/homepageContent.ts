/**
 * Homepage v2 static content
 *
 * Copy is identical to the previous homepage iteration; only the
 * presentation layer changed. Product data is NOT here — it comes from the
 * server cache (getCachedProductsWithPricing).
 */

export const MAX_HOME_PRODUCTS = 4;

// Featured carousel - blueprint IDs to exclude from the carousel
export const FEATURED_CAROUSEL_EXCLUDED_BLUEPRINTS = new Set([12]);

// Process section - stagger delay between card reveals (ms)
export const PROCESS_STAGGER_DELAY_MS = 120;

// Trust guarantees section - stagger delay between card reveals (ms)
export const TRUST_GUARANTEES_STAGGER_DELAY_MS = 100;

// Hero section image carousel - cycles through product images
export const HOME_HERO_IMAGES = [
  "/home/1-a.png",
  "/home/1-b.png",
  "/home/2-a.png",
  "/home/2-b.png",
  "/home/3-a.png",
  "/home/3-b.png",
  "/home/4-a.png",
  "/home/4-b.png",
  "/home/5-a.png",
  "/home/5-b.png",
  "/home/6-a.png",
  "/home/6-b.png",
];

// Hero product grid - grouped image sets for each square
// Each set cycles independently with staggered timing
export const HERO_PRODUCT_SETS: string[][] = [
  // Top-right (large) - products 1 & 2
  ["/home/1-a.png", "/home/1-b.png", "/home/2-a.png", "/home/2-b.png"],
  // Middle-left (medium) - products 3 & 4
  ["/home/3-a.png", "/home/3-b.png", "/home/4-a.png", "/home/4-b.png"],
  // Bottom-right (medium) - products 5 & 6
  ["/home/5-a.png", "/home/5-b.png", "/home/6-a.png", "/home/6-b.png"],
  // Bottom-left (small) - mix of all
  ["/home/1-a.png", "/home/3-a.png", "/home/5-a.png", "/home/2-a.png"],
];

// Hero bubbling products - product images that float up on scroll
export type HeroBubblingProductType = {
  src: string;
  alt: string;
  size: "sm" | "md" | "lg";
  startX: number; // percentage from left (0-100)
  delay: number; // animation delay in ms
};

export const HERO_BUBBLING_PRODUCTS: HeroBubblingProductType[] = [
  // Row 1 - Bottom layer (appears first)
  { src: "/products-images/tote/tote-a-printed.png", alt: "Custom tote bag with AI design", size: "lg", startX: 12, delay: 0 },
  { src: "/products-images/kid t-shirt/kid-t-shirt-b-printed.jpeg", alt: "Personalized children's tee", size: "lg", startX: 70, delay: 0 },
  { src: "/home/2-a.png", alt: "Custom hoodie design", size: "md", startX: 42, delay: 0 },
  // Row 2
  { src: "/products-images/tote/tote-b-printed.png", alt: "Personalized canvas tote", size: "md", startX: 28, delay: 100 },
  { src: "/home/1-a.png", alt: "AI-designed apparel", size: "md", startX: 88, delay: 100 },
  { src: "/products-images/kid t-shirt/kid-t-shirt-a-printed.png", alt: "Custom kids t-shirt", size: "sm", startX: 55, delay: 100 },
  // Row 3
  { src: "/home/3-a.png", alt: "Custom print product", size: "sm", startX: 8, delay: 200 },
  { src: "/products-images/tote/tote-c-printed.png", alt: "Unique tote bag design", size: "sm", startX: 38, delay: 200 },
  { src: "/home/4-a.png", alt: "Designer merchandise", size: "md", startX: 78, delay: 200 },
  // Row 4
  { src: "/home/5-a.png", alt: "Personalized merchandise", size: "sm", startX: 22, delay: 300 },
  { src: "/home/6-a.png", alt: "Custom apparel piece", size: "sm", startX: 62, delay: 300 },
  { src: "/home/1-b.png", alt: "AI-generated design", size: "sm", startX: 92, delay: 300 },
  // Row 5 - Top layer (appears last)
  { src: "/home/2-b.png", alt: "Unique print design", size: "sm", startX: 48, delay: 400 },
  { src: "/home/3-b.png", alt: "Creative merchandise", size: "sm", startX: 5, delay: 400 },
  { src: "/home/4-b.png", alt: "Custom creation", size: "sm", startX: 82, delay: 400 },
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
