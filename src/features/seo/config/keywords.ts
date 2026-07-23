export const KEYWORDS = {
  primary: [
    "AI t-shirt design",
    "custom AI apparel",
    "AI t-shirt generator",
    "print on demand",
  ],
  product: [
    "custom t-shirts",
    "custom hoodies",
    "personalized apparel",
    "heavyweight t-shirts",
    "premium print quality",
  ],
  transactional: [
    "design your own t-shirt",
    "create custom t-shirt online",
    "order custom apparel",
    "buy custom t-shirts",
  ],
  informational: [
    "how to design t-shirts with AI",
    "AI clothing design",
    "text to t-shirt",
    "AI image to apparel",
  ],
  longTail: [
    "AI generated t-shirt designs",
    "custom heavyweight t-shirts online",
    "made to order AI apparel",
    "carbon neutral custom clothing",
  ],
} as const;

export const PAGE_KEYWORDS = {
  home: [
    ...KEYWORDS.primary,
    ...KEYWORDS.product,
    "AI design generator",
    "custom hoodies",
  ],
  stamp: [
    "AI design studio",
    "create custom t-shirt",
    "text to t-shirt design",
    "AI image to apparel",
    "custom print maker",
    "design t-shirt online",
  ],
  cart: ["shopping cart", "review order", "custom apparel checkout"],
  checkout: ["secure checkout", "order confirmation", "safe payment"],
  orders: ["order history", "track order", "order status", "my orders"],
  dashboard: ["design dashboard", "my designs", "saved creations"],
  profile: ["account settings", "user profile", "shipping address"],
} as const;
