import {
  BrainCircuit,
  Eye,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { FaCreditCard, FaPaypal } from "react-icons/fa";
import { SiStripe } from "react-icons/si";

export const processSteps = [
  {
    id: "01",
    label: "Studio",
    title: "Design Selection",
    description:
      "Choose from our curated minimalist library or upload custom assets.",
    icon: Palette,
  },
  {
    id: "02",
    label: "Canvas",
    title: "Customization",
    description:
      "Modify colors, layers, and typographic elements with precision.",
    icon: BrainCircuit,
  },
  {
    id: "03",
    label: "Texture",
    title: "Sizing & Fit",
    description:
      "Select size, fabric, and finish matching your creative vision.",
    icon: Shirt,
  },
  {
    id: "04",
    label: "Final",
    title: "Preview & Review",
    description:
      "Verify every visual layer and color registration before production.",
    icon: Eye,
  },
  {
    id: "05",
    label: "Engine",
    title: "AI Synthesis",
    description:
      "Describe your design idea and let the AI synthesize variations.",
    icon: Sparkles,
  },
  {
    id: "06",
    label: "Complete",
    title: "Ready to Cart",
    description:
      "Your custom tee is ready. Add it to cart and proceed to checkout.",
    icon: ShoppingBag,
  },
] as const;

export const journeyDesktopPositions = [
  "top-0 left-0",
  "top-[300px] left-[18%]",
  "top-0 left-[36%]",
  "top-[300px] left-[54%]",
  "top-0 left-[72%]",
  "top-[300px] left-[90%]",
] as const;

export const trustHighlights = [
  {
    title: "Memories",
    description:
      "Every design is a story. Transform meaningful moments into wearable art — gifts and garments that outlast the occasion.",
  },
  {
    title: "Precision",
    description:
      "Every stitch and visual layer registered for flawless production output, exactly as you imagined it.",
  },
  {
    title: "14-Day Guarantee",
    description:
      "Total refund within 14 days — no explanation required. We stand unconditionally behind every stamp we help you create.",
  },
  {
    title: "Innovation",
    description:
      "AI-powered synthesis unlocks premium design variations with minimal effort — creativity without compromise.",
  },
] as const;

export const faqs = [
  {
    q: "What file formats do you accept for designs?",
    a: "We support PNG, JPG, WEBP, and SVG files up to 25MB. For best results, use high-resolution source files.",
  },
  {
    q: "How long does production take?",
    a: "Standard production is usually 5-7 business days. Express options are available at checkout.",
  },
  {
    q: "Can I make changes after ordering?",
    a: "Changes are possible within a short post-order window before production starts.",
  },
  {
    q: "What's your return and refund policy?",
    a: "We offer a 30-day money-back guarantee for manufacturing defects or shipping damages.",
  },
  {
    q: "Do you offer bulk orders?",
    a: "Yes. Bulk and team workflows are available through our Enterprise offering.",
  },
  {
    q: "What printing methods do you use?",
    a: "We use premium screen-printing and DTG workflows based on your design requirements.",
  },
  {
    q: "Is my design data private?",
    a: "Yes. Assets are encrypted in transit and at rest, and ownership stays with you.",
  },
] as const;

export const paymentMethods = [
  {
    name: "Stripe Checkout",
    description: "Visa, Mastercard, AMEX & Apple Pay. All cards processed securely.",
    badge: "PCI-DSS Level 1",
    icon: SiStripe,
  },
  {
    name: "PayPal Express",
    description: "Pay with PayPal balance or linked cards with buyer protection.",
    badge: "Purchase Protection",
    icon: FaPaypal,
  },
  {
    name: "Mollie Hub",
    description: "Regional methods including Klarna, iDEAL, and Bancontact.",
    badge: "Secure Gateway",
    icon: FaCreditCard,
  },
] as const;

export const reviewBreakdown = [
  { label: "5★", value: 85, barClass: "bg-[#FF8C42]" },
  { label: "4★", value: 10, barClass: "bg-[#FF8C42]/75" },
  { label: "3★", value: 3, barClass: "bg-amber-400/80" },
  { label: "2★", value: 1, barClass: "bg-orange-300/70" },
  { label: "1★", value: 1, barClass: "bg-red-500" },
] as const;

export const reviews = [
  {
    name: "Sarah Chen",
    date: "3w ago",
    source: "Google",
    sourceUrl: "https://www.google.com/search?q=stamp.ai+reviews",
    quote:
      '"Best custom apparel service I\'ve used. Quality is insane. Every stitch is perfect."',
    helpful: "245 found helpful",
  },
  {
    name: "Marcus Vane",
    date: "1m ago",
    source: "Google",
    sourceUrl: "https://www.google.com/search?q=stamp.ai+reviews",
    quote:
      '"The design interface is incredibly intuitive. A pure game-changer for my brand\'s merch flow."',
    helpful: "112 found helpful",
  },
  {
    name: "Alex Rodriguez",
    date: "2m ago",
    source: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/",
    quote:
      '"Great service, shipping took a bit longer than expected but the final product was worth it."',
    helpful: "89 found helpful",
  },
  {
    name: "Jamie Liu",
    date: "6w ago",
    source: "Google",
    sourceUrl: "https://www.google.com/search?q=stamp.ai+reviews",
    quote:
      '"Premium quality and fast turnaround. The heavy cotton feels like true luxury wear."',
    helpful: "302 found helpful",
  },
  {
    name: "Taylor Brooks",
    date: "2m ago",
    source: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/",
    quote:
      '"Stamp.AI revolutionized how we create branded merchandise. No more back-and-forth."',
    helpful: "156 found helpful",
  },
  {
    name: "Casey Johnson",
    date: "3m ago",
    source: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/",
    quote:
      '"Customer service is exceptional, product quality matches pricing perfectly. True 5-star studio."',
    helpful: "94 found helpful",
  },
] as const;

export const SECTION_IDS = [
  "hero",
  "cta-home",
  "process",
  "brand-story",
  "pricing",
  "faq",
  "security",
  "reviews",
] as const;

export type HomepageSectionIdT = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<HomepageSectionIdT, string> = {
  hero: "Home",
  "cta-home": "Start",
  process: "Process",
  "brand-story": "Story",
  pricing: "Products",
  faq: "FAQ",
  security: "Security",
  reviews: "Reviews",
};

export const NAVBAR_HEIGHT = 80;
export const SCROLL_COOLDOWN = 220;
export const SCROLL_DURATION = 360;
