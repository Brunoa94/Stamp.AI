export const SHIPPING_METHODS = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "3-5 Business Days",
    price: "Free",
    priceClass: "text-green-600",
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1-2 Business Days",
    price: "$10.00",
    priceClass: "text-slate-900",
  },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];