export type ShippingMethod = "standard" | "express";

export interface ShippingMethodOption {
  id: ShippingMethod;
  label: string;
  description: string;
  price: string;
  priceClass: string;
}

export const SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "3-5 Business Days",
    price: "Free",
    priceClass: "text-green-600 font-bold text-sm uppercase",
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1-2 Business Days",
    price: "$10.00",
    priceClass: "text-base font-bold text-slate-900",
  },
];
