import { Metadata } from "next";
import { SITE_URL, SITE_NAME, BRAND_COLORS } from "../config/site";
import { OG_IMAGE, TWITTER_CONFIG, TWITTER_IMAGE } from "../config/social";
import { PAGE_KEYWORDS } from "../config/keywords";
import { VERIFICATION, APPLE_CONFIG } from "../config/platform";
import { titleTemplate } from "./title";

export function generateRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: titleTemplate,
    description:
      "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
    keywords: [...PAGE_KEYWORDS.home],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    verification: {
      google: VERIFICATION.google,
      yandex: VERIFICATION.yandex,
      other: {
        ...(VERIFICATION.bing && { "msvalidate.01": VERIFICATION.bing }),
        ...(VERIFICATION.pinterest && {
          "p:domain_verify": VERIFICATION.pinterest,
        }),
      },
    },
    applicationName: SITE_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    appleWebApp: {
      capable: true,
      statusBarStyle: APPLE_CONFIG.statusBarStyle,
      title: APPLE_CONFIG.title,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    category: "shopping",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: titleTemplate.default,
      description:
        "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
      images: [
        {
          url: OG_IMAGE.url,
          secureUrl: OG_IMAGE.secureUrl,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: OG_IMAGE.alt,
          type: OG_IMAGE.type,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.cardType,
      site: TWITTER_CONFIG.site,
      creator: TWITTER_CONFIG.creator,
      title: titleTemplate.default,
      description:
        "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
      images: [
        {
          url: TWITTER_IMAGE.url,
          alt: TWITTER_IMAGE.alt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "theme-color": BRAND_COLORS.themeLight,
      "color-scheme": "light dark",
      "msapplication-TileColor": BRAND_COLORS.primary,
    },
  };
}
