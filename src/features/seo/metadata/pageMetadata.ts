import { Metadata } from "next";
import { SITE_NAME, ALTERNATE_LANGUAGES } from "../config/site";
import { OG_IMAGE, TWITTER_CONFIG, TWITTER_IMAGE } from "../config/social";
import { optimizeDescription } from "./description";
import { getCanonicalUrl, shouldNoindex } from "./url";
import type { PageMetadataOptions } from "./types";

export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    ogImage = OG_IMAGE.url,
    ogImageAlt = OG_IMAGE.alt,
    noindex,
    openGraph = {},
    twitter = {},
  } = options;

  const canonicalUrl = getCanonicalUrl(path);
  const optimizedDescription = optimizeDescription(description);
  const isNoindex = noindex ?? shouldNoindex(path);

  return {
    title,
    description: optimizedDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ALTERNATE_LANGUAGES.map((lang) => [
          lang.hrefLang,
          `${lang.href}${path}`,
        ])
      ),
    },
    robots: isNoindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
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
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description: optimizedDescription,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: ogImageAlt,
          type: OG_IMAGE.type,
        },
      ],
      ...openGraph,
    },
    twitter: {
      card: TWITTER_CONFIG.cardType,
      site: TWITTER_CONFIG.site,
      creator: TWITTER_CONFIG.creator,
      title,
      description: optimizedDescription,
      images: [
        {
          url: TWITTER_IMAGE.url,
          alt: TWITTER_IMAGE.alt,
        },
      ],
      ...twitter,
    },
  };
}
