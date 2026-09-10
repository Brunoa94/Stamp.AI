/**
 * FAQ page content registry.
 *
 * Stable ids only — questions and answers live in src/i18n/messages/en.json
 * under `faq.categories.<id>` and `faq.items.<id>`.
 */

export const FAQ_CATEGORIES = [
  {
    id: "design-ai",
    items: [
      "prompt-tips",
      "upload-own-art",
      "design-ownership",
      "not-happy-with-design",
      "prohibited-content",
    ],
  },
  {
    id: "ordering",
    items: [
      "what-are-credits",
      "credits-expire",
      "payment-methods",
      "change-order",
      "bulk-orders",
    ],
  },
  {
    id: "products-sizing",
    items: ["product-range", "sizing", "print-durability", "care-instructions"],
  },
  {
    id: "shipping",
    items: ["where-printed", "shipping-cost", "customs", "track-order"],
  },
  {
    id: "returns",
    items: ["return-window", "wrong-size-ordered", "refund-time"],
  },
  {
    id: "account",
    items: ["delete-account", "data-privacy", "contact-human"],
  },
] as const;
