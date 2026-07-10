/**
 * Homepage v2 static content
 *
 * Copy is identical to the original homepage (homepage-brutalist); only the
 * presentation layer changed. Product data is NOT here — it comes from the
 * server cache (getCachedFeaturedProductsWithPricing).
 */

export const MAX_HOME_PRODUCTS = 8;

export type HomeProcessStepType = {
  id: string;
  number: string;
  title: string;
  description: string;
};

export const HOME_PROCESS_STEPS: HomeProcessStepType[] = [
  {
    id: "step-studio",
    number: "01",
    title: "Studio",
    description:
      "Design Selection: Choose from our curated minimalist library or upload custom artwork for AI enhancement.",
  },
  {
    id: "step-synthesis",
    number: "02",
    title: "Synthesis",
    description:
      "AI Processing: Our neural network optimizes your design for archival print quality and color accuracy.",
  },
  {
    id: "step-material",
    number: "03",
    title: "Material",
    description:
      "Fabric Selection: Choose from heavyweight premium blanks (280-480GSM) engineered for longevity.",
  },
  {
    id: "step-production",
    number: "04",
    title: "Production",
    description:
      "Direct-to-Garment: High-precision DTG printing with eco-friendly water-based inks on demand.",
  },
  {
    id: "step-quality",
    number: "05",
    title: "Quality",
    description:
      "Inspection Protocol: Every piece hand-inspected for print fidelity, fabric integrity, and finish.",
  },
  {
    id: "step-delivery",
    number: "06",
    title: "Delivery",
    description:
      "Global Logistics: Carbon-neutral shipping with real-time tracking. Arrives in 5-7 business days.",
  },
];

export type HomeValueCardType = {
  number: string;
  title: string;
  description: string;
};

export const HOME_VALUE_CARDS: HomeValueCardType[] = [
  {
    number: "01",
    title: "AI-Powered",
    description:
      "Neural network-enhanced design synthesis for maximum creative output with minimal effort.",
  },
  {
    number: "02",
    title: "Archival Quality",
    description:
      "Premium heavyweight fabrics (280-480GSM) engineered for decades of wear without degradation.",
  },
  {
    number: "03",
    title: "On-Demand",
    description:
      "Zero inventory waste. Every piece produced after order confirmation to minimize environmental impact.",
  },
  {
    number: "04",
    title: "Global Logistics",
    description:
      "Carbon-neutral shipping to 180+ countries with real-time tracking and 5-7 day delivery windows.",
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

export type HomeTestimonialType = {
  author: string;
  role: string;
  platform: string;
  rating: number;
  helpful: number;
  quote: string;
};

export const HOME_TESTIMONIALS: HomeTestimonialType[] = [
  {
    author: "Alex Chen",
    role: "Creative Director",
    platform: "Trustpilot",
    rating: 5,
    helpful: 127,
    quote:
      "The AI synthesis is incredible. Took my rough sketch and turned it into a museum-quality print. The heavyweight fabric feels built to last decades.",
  },
  {
    author: "Jordan Ellis",
    role: "Streetwear Designer",
    platform: "Google",
    rating: 5,
    helpful: 94,
    quote:
      "Finally, a platform that understands archival quality. The 320GSM essentials tee is hands down the best blank I've ever printed on.",
  },
  {
    author: "Morgan Park",
    role: "Independent Artist",
    platform: "ProductHunt",
    rating: 5,
    helpful: 156,
    quote:
      "Zero design experience needed. The AI understood my vision perfectly. Shipped in 6 days globally. This is the future of custom apparel.",
  },
  {
    author: "Riley Santos",
    role: "Brand Consultant",
    platform: "Trustpilot",
    rating: 5,
    helpful: 83,
    quote:
      "The on-demand model eliminates inventory risk. Print quality is consistent across batches. Game-changer for small brands.",
  },
];

export type HomeFaqType = {
  question: string;
  answer: string;
};

export const HOME_FAQS: HomeFaqType[] = [
  {
    question: "How does the AI design synthesis work?",
    answer:
      "Our neural network analyzes your input (text prompt, sketch, or reference image) and generates optimized graphics tailored for direct-to-garment printing. The AI considers color profiles, resolution requirements, and fabric texture to ensure archival-quality output. No design experience required—just describe your vision.",
  },
  {
    question: "What makes your fabrics 'archival quality'?",
    answer:
      "We exclusively use heavyweight premium blanks (280-480GSM) engineered for longevity. Our garment-dyed essentials undergo pre-shrinking and enzyme wash treatments to prevent degradation. Combined with water-based eco-friendly inks, your piece will maintain structural integrity and color fidelity for decades.",
  },
  {
    question: "How long does production and shipping take?",
    answer:
      "Production begins immediately after order confirmation. Direct-to-garment printing completes in 2-3 business days, followed by quality inspection. Global shipping via carbon-neutral carriers takes 3-4 business days. Total timeline: 5-7 business days from order to delivery, with real-time tracking.",
  },
  {
    question: "What are your sustainability practices?",
    answer:
      "We operate a zero-inventory on-demand model to eliminate textile waste. Our DTG printing uses water-based inks with no harmful chemicals. All shipping is carbon-offset through verified reforestation programs. Packaging uses recycled materials. We're committed to minimizing environmental impact at every stage.",
  },
  {
    question: "Can I order samples before bulk production?",
    answer:
      "Absolutely. We recommend ordering a single piece first to verify fit, fabric feel, and print quality. There's no minimum order quantity—every piece is produced on-demand. Once satisfied, you can reorder identical designs at any scale. Volume discounts available for orders of 25+ pieces.",
  },
  {
    question: "What if I'm not satisfied with my order?",
    answer:
      "We offer a 30-day satisfaction guarantee. If your piece doesn't meet expectations due to print quality, fabric defects, or fit issues, we'll replace it at no cost or issue a full refund. Return shipping is covered. Custom designs cannot be resold, so we're committed to getting it right the first time.",
  },
];

export type HomeTrustIndicatorType = string;

export const HOME_HERO_TRUST: HomeTrustIndicatorType[] = [
  "AI-Powered",
  "Archival Quality",
  "Instant Delivery",
];

export const HOME_CTA_TRUST: HomeTrustIndicatorType[] = [
  "5-7 Day Delivery",
  "30-Day Guarantee",
  "Carbon Neutral",
];
