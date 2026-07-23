import { MetadataRoute } from "next";
import { SITE_URL } from "@/features/seo/config/site";
import { ROUTE_SEO } from "@/features/seo/config/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
