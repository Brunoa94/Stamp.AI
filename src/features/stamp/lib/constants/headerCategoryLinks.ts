/**
 * Links in the header's category row (md and up), in display order. Labels
 * live in `stamp.header.categories.<id>`.
 */
export const HEADER_CATEGORY_LINKS = [
  { id: "studio", href: "/stamp" },
  { id: "allProducts", href: "/catalog" },
  { id: "popular", href: "/#products" },
  { id: "gifts", href: "/#gift-ideas" },
  { id: "howItWorks", href: "/#process" },
  { id: "shipping", href: "/shipping" },
  { id: "help", href: "/faq" },
] as const;
