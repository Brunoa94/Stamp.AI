import { SITE_URL, SITE_NAME } from "./site";

export const SOCIAL_PROFILES = {
  twitter: "https://twitter.com/stampai",
  instagram: "https://instagram.com/stampai",
  linkedin: "https://linkedin.com/company/stampai",
  tiktok: "https://tiktok.com/@stampai",
} as const;

export const TWITTER_CONFIG = {
  handle: "stampai",
  site: "@stampai",
  creator: "@stampai",
  cardType: "summary_large_image" as const,
} as const;

export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  secureUrl: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} - Create Custom AI-Designed Apparel`,
  type: "image/jpeg",
} as const;

export const TWITTER_IMAGE = {
  url: `${SITE_URL}/twitter-card.jpg`,
  alt: `${SITE_NAME} - AI-Powered Custom T-Shirt Design`,
} as const;
