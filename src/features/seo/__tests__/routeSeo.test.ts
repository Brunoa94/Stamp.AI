import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { ROUTE_SEO } from "../config/routes";

/**
 * Guard: every route registered for the sitemap (index: true) must have a
 * real page under src/app, so the sitemap never advertises a 404.
 */
describe("ROUTE_SEO", () => {
  const appDir = path.resolve(__dirname, "../../../app");

  const indexedRoutes = Object.values(ROUTE_SEO).filter(
    (route) => route.index
  );

  it.each(indexedRoutes.map((route) => [route.path]))(
    "indexed route %s has a page.tsx under src/app",
    (routePath) => {
      const segment = routePath === "/" ? "" : routePath;
      expect(existsSync(path.join(appDir, segment, "page.tsx"))).toBe(true);
    }
  );
});
