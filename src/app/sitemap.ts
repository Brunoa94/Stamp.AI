import { MetadataRoute } from "next";
import { SITE_URL, ROUTE_SEO } from "@/features/seo/config";

/**
 * Dynamic sitemap generation
 *
 * Generates a sitemap.xml for search engines with all public routes.
 * Only includes routes that should be indexed (index: true in ROUTE_SEO).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Get all indexable routes from configuration
  const routes = Object.values(ROUTE_SEO)
    .filter((route) => route.index)
    .map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changefreq,
      priority: route.priority,
    }));

  return routes;
}
