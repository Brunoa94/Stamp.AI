import { SITE_URL, SITE_NAME, BRAND_COLORS } from "./site";

export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
} as const;

export const APPLE_CONFIG = {
  capable: "yes" as const,
  statusBarStyle: "black-translucent" as const,
  title: SITE_NAME,
  touchIcon: `${SITE_URL}/apple-touch-icon.png`,
} as const;

export const MS_CONFIG = {
  tileColor: BRAND_COLORS.primary,
  tileImage: `${SITE_URL}/mstile-144x144.png`,
} as const;
