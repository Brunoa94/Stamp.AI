import { SITE_URL } from "../config/site";
import { NOINDEX_PATHS } from "../config/routes";

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function shouldNoindex(path: string): boolean {
  return NOINDEX_PATHS.some((pattern) => {
    if (pattern.endsWith("*")) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  });
}
