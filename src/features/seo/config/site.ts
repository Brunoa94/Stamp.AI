export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://stamp.ai";

export const SITE_NAME = "Stamp AI";

export const DEFAULT_LOCALE = "en-US";

export const SUPPORTED_LOCALES = ["en-US"] as const;

export const BRAND_COLORS = {
  primary: "#0a0a0a",
  secondary: "#ffffff",
  accent: "#ff6b00",
  themeLight: "#ffffff",
  themeDark: "#0a0a0a",
} as const;

export const CTA_PHRASES = {
  home: "Start for free today",
  stamp: "Create your design now",
  general: "No design skills needed",
  urgency: "Ships in 5-7 days",
  trust: "30-day guarantee",
} as const;

export const ALTERNATE_LANGUAGES = [
  { hrefLang: "en-US", href: SITE_URL },
  { hrefLang: "x-default", href: SITE_URL },
] as const;
