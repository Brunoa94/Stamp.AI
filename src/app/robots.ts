import { MetadataRoute } from "next";
import { SITE_URL, DISALLOW_PATHS } from "@/features/seo/config";

/**
 * Dynamic robots.txt generation
 *
 * Controls how search engines crawl the site.
 * - Allows crawling of public pages
 * - Disallows crawling of private/user-specific pages
 * - Points to sitemap for efficient indexing
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOW_PATHS],
      },
      // Block specific bots that are resource-intensive
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
