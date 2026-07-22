export const ROUTE_SEO = {
  home: {
    path: "/",
    priority: 1.0,
    changefreq: "daily" as const,
    index: true,
  },
  stamp: {
    path: "/stamp",
    priority: 0.9,
    changefreq: "weekly" as const,
    index: true,
  },
  cart: {
    path: "/cart",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false,
  },
  checkout: {
    path: "/checkout",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false,
  },
  orders: {
    path: "/orders",
    priority: 0.4,
    changefreq: "monthly" as const,
    index: false,
  },
  dashboard: {
    path: "/dashboard",
    priority: 0.4,
    changefreq: "monthly" as const,
    index: false,
  },
  profile: {
    path: "/profile",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false,
  },
  resetPassword: {
    path: "/reset-password",
    priority: 0.2,
    changefreq: "yearly" as const,
    index: false,
  },
  authCodeError: {
    path: "/auth/auth-code-error",
    priority: 0.1,
    changefreq: "yearly" as const,
    index: false,
  },
} as const;

export const NOINDEX_PATHS = [
  "/cart",
  "/checkout",
  "/checkout/*",
  "/orders",
  "/dashboard",
  "/profile",
  "/reset-password",
  "/auth/*",
] as const;

export const DISALLOW_PATHS = [
  "/api/",
  "/checkout/",
  "/cart",
  "/orders",
  "/dashboard",
  "/profile",
  "/reset-password",
  "/auth/",
  "/_next/",
  "/private/",
] as const;
