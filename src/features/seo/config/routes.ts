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
  catalog: {
    path: "/catalog",
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
  faq: {
    path: "/faq",
    priority: 0.7,
    changefreq: "monthly" as const,
    index: true,
  },
  shipping: {
    path: "/shipping",
    priority: 0.6,
    changefreq: "monthly" as const,
    index: true,
  },
  returns: {
    path: "/returns",
    priority: 0.6,
    changefreq: "monthly" as const,
    index: true,
  },
  terms: {
    path: "/terms",
    priority: 0.4,
    changefreq: "yearly" as const,
    index: true,
  },
  privacy: {
    path: "/privacy",
    priority: 0.4,
    changefreq: "yearly" as const,
    index: true,
  },
  cookies: {
    path: "/cookies",
    priority: 0.4,
    changefreq: "yearly" as const,
    index: true,
  },
  security: {
    path: "/security",
    priority: 0.4,
    changefreq: "yearly" as const,
    index: true,
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
