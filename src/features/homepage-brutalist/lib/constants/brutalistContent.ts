/**
 * Brutalist Homepage Content
 *
 * Centralized content for all brutalist homepage sections
 */

// Product catalog
export const brutalistProducts = [
  {
    id: "product-essential-tee",
    name: "Essential Box Tee",
    price: 48.0,
    specs: "Garment Dyed / 320GSM",
    label: "HEAVY_TEE_WHT",
    imageUrl: "/images/products/tee-white.jpg",
    href: "/products/essential-box-tee",
  },
  {
    id: "product-archive-hoodie",
    name: "Archive Hoodie",
    price: 128.0,
    specs: "Heavyweight / 480GSM",
    label: "ARCH_HOOD_BLK",
    imageUrl: "/images/products/hoodie-black.jpg",
    href: "/products/archive-hoodie",
  },
  {
    id: "product-precision-cap",
    name: "Precision Cap",
    price: 38.0,
    specs: "Structured / Canvas",
    label: "PREC_CAP_NAV",
    imageUrl: "/images/products/cap-navy.jpg",
    href: "/products/precision-cap",
  },
  {
    id: "product-studio-longsleeve",
    name: "Studio Longsleeve",
    price: 58.0,
    specs: "Ribbed Cuff / 280GSM",
    label: "STUDIO_LS_GRY",
    imageUrl: "/images/products/longsleeve-grey.jpg",
    href: "/products/studio-longsleeve",
  },
] as const;

// Process steps
export const brutalistProcess = [
  {
    id: "process-step-1",
    number: "01",
    title: "Studio",
    description:
      "Design Selection: Choose from our curated minimalist library or upload custom artwork for AI enhancement.",
    hoverColor: "hover:bg-brandPurple",
  },
  {
    id: "process-step-2",
    number: "02",
    title: "Synthesis",
    description:
      "AI Processing: Our neural network optimizes your design for archival print quality and color accuracy.",
    hoverColor: "hover:bg-brandCyan",
  },
  {
    id: "process-step-3",
    number: "03",
    title: "Material",
    description:
      "Fabric Selection: Choose from heavyweight premium blanks (280-480GSM) engineered for longevity.",
    hoverColor: "hover:bg-brandOrange",
  },
  {
    id: "process-step-4",
    number: "04",
    title: "Production",
    description:
      "Direct-to-Garment: High-precision DTG printing with eco-friendly water-based inks on demand.",
    hoverColor: "hover:bg-brandRed",
  },
  {
    id: "process-step-5",
    number: "05",
    title: "Quality",
    description:
      "Inspection Protocol: Every piece hand-inspected for print fidelity, fabric integrity, and finish.",
    hoverColor: "hover:bg-brandPurple",
  },
  {
    id: "process-step-6",
    number: "06",
    title: "Delivery",
    description:
      "Global Logistics: Carbon-neutral shipping with real-time tracking. Arrives in 5-7 business days.",
    hoverColor: "hover:bg-brandCyan",
  },
] as const;

// About section value cards
export const brutalistAboutCards = [
  {
    id: "value-ai-powered",
    title: "AI-Powered",
    description:
      "Neural network-enhanced design synthesis for maximum creative output with minimal effort.",
    color: "border-brandPurple hover:border-brandPurple/80",
  },
  {
    id: "value-archival-quality",
    title: "Archival Quality",
    description:
      "Premium heavyweight fabrics (280-480GSM) engineered for decades of wear without degradation.",
    color: "border-brandCyan hover:border-brandCyan/80",
  },
  {
    id: "value-on-demand",
    title: "On-Demand",
    description:
      "Zero inventory waste. Every piece produced after order confirmation to minimize environmental impact.",
    color: "border-brandOrange hover:border-brandOrange/80",
  },
  {
    id: "value-global-logistics",
    title: "Global Logistics",
    description:
      "Carbon-neutral shipping to 180+ countries with real-time tracking and 5-7 day delivery windows.",
    color: "border-brandRed hover:border-brandRed/80",
  },
] as const;

// Reviews and testimonials
export const brutalistRatingSummary = {
  overall: 4.8,
  totalReviews: 1247,
  platforms: [
    { name: "Trustpilot", rating: 4.9, reviews: 523 },
    { name: "Google", rating: 4.8, reviews: 412 },
    { name: "ProductHunt", rating: 4.7, reviews: 312 },
  ],
} as const;

export const brutalistTestimonials = [
  {
    id: "review-1",
    author: "Alex Chen",
    role: "Creative Director",
    platform: "Trustpilot",
    rating: 5,
    text: "The AI synthesis is incredible. Took my rough sketch and turned it into a museum-quality print. The heavyweight fabric feels built to last decades.",
    helpful: 127,
  },
  {
    id: "review-2",
    author: "Jordan Ellis",
    role: "Streetwear Designer",
    platform: "Google",
    rating: 5,
    text: "Finally, a platform that understands archival quality. The 320GSM essentials tee is hands down the best blank I've ever printed on.",
    helpful: 94,
  },
  {
    id: "review-3",
    author: "Morgan Park",
    role: "Independent Artist",
    platform: "ProductHunt",
    rating: 5,
    text: "Zero design experience needed. The AI understood my vision perfectly. Shipped in 6 days globally. This is the future of custom apparel.",
    helpful: 156,
  },
  {
    id: "review-4",
    author: "Riley Santos",
    role: "Brand Consultant",
    platform: "Trustpilot",
    rating: 5,
    text: "The on-demand model eliminates inventory risk. Print quality is consistent across batches. Game-changer for small brands.",
    helpful: 83,
  },
] as const;

// FAQ items
export const brutalistFaqs = [
  {
    id: "faq-1",
    question: "How does the AI design synthesis work?",
    answer:
      "Our neural network analyzes your input (text prompt, sketch, or reference image) and generates optimized graphics tailored for direct-to-garment printing. The AI considers color profiles, resolution requirements, and fabric texture to ensure archival-quality output. No design experience required—just describe your vision.",
    borderColor:
      "border-ink/10 hover:border-brandPurple/50 open:border-brandPurple",
  },
  {
    id: "faq-2",
    question: "What makes your fabrics 'archival quality'?",
    answer:
      "We exclusively use heavyweight premium blanks (280-480GSM) engineered for longevity. Our garment-dyed essentials undergo pre-shrinking and enzyme wash treatments to prevent degradation. Combined with water-based eco-friendly inks, your piece will maintain structural integrity and color fidelity for decades.",
    borderColor:
      "border-ink/10 hover:border-brandCyan/50 open:border-brandCyan",
  },
  {
    id: "faq-3",
    question: "How long does production and shipping take?",
    answer:
      "Production begins immediately after order confirmation. Direct-to-garment printing completes in 2-3 business days, followed by quality inspection. Global shipping via carbon-neutral carriers takes 3-4 business days. Total timeline: 5-7 business days from order to delivery, with real-time tracking.",
    borderColor:
      "border-ink/10 hover:border-brandOrange/50 open:border-brandOrange",
  },
  {
    id: "faq-4",
    question: "What are your sustainability practices?",
    answer:
      "We operate a zero-inventory on-demand model to eliminate textile waste. Our DTG printing uses water-based inks with no harmful chemicals. All shipping is carbon-offset through verified reforestation programs. Packaging uses recycled materials. We're committed to minimizing environmental impact at every stage.",
    borderColor:
      "border-ink/10 hover:border-brandPurple/50 open:border-brandPurple",
  },
  {
    id: "faq-5",
    question: "Can I order samples before bulk production?",
    answer:
      "Absolutely. We recommend ordering a single piece first to verify fit, fabric feel, and print quality. There's no minimum order quantity—every piece is produced on-demand. Once satisfied, you can reorder identical designs at any scale. Volume discounts available for orders of 25+ pieces.",
    borderColor:
      "border-ink/10 hover:border-brandCyan/50 open:border-brandCyan",
  },
  {
    id: "faq-6",
    question: "What if I'm not satisfied with my order?",
    answer:
      "We offer a 30-day satisfaction guarantee. If your piece doesn't meet expectations due to print quality, fabric defects, or fit issues, we'll replace it at no cost or issue a full refund. Return shipping is covered. Custom designs cannot be resold, so we're committed to getting it right the first time.",
    borderColor:
      "border-ink/10 hover:border-brandOrange/50 open:border-brandOrange",
  },
] as const;
