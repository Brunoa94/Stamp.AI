import type { PromoCodeT } from "@/types/promocode";

export const FALLBACK_PROMO_CODES: PromoCodeT[] = [
  {
    promocode_id: "fallback-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    created_at: null,
  },
  {
    promocode_id: "fallback-2",
    code: "SPRING15",
    type: "percentage",
    value: 15,
    created_at: null,
  },
  {
    promocode_id: "fallback-3",
    code: "SAVE5",
    type: "numeric",
    value: 5,
    created_at: null,
  },
] as const;

export const PROMO_CAROUSEL_ANIMATION_DURATION_MS = 34000;
