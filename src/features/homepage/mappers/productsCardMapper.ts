import type { TshirtType } from "@/types/product";

const PRODUCT_CARD_GRADIENTS = [
  "from-white/90 via-[#06B6D4]/10 to-[#7C3AED]/12",
  "from-[#7C3AED]/16 via-white/95 to-[#06B6D4]/14",
  "from-white/90 via-[#FF8C42]/14 to-[#7C3AED]/12",
] as const;

const DEFAULT_PRODUCT_PRICE_FROM = 25;

export function mapProductIndexToCardGradient(index: number): string {
  const safeIndex =
    ((index % PRODUCT_CARD_GRADIENTS.length) + PRODUCT_CARD_GRADIENTS.length) %
    PRODUCT_CARD_GRADIENTS.length;

  return PRODUCT_CARD_GRADIENTS[safeIndex];
}

export function mapProductToPriceFrom(product: TshirtType): number {
  return product.price > 0 ? product.price : DEFAULT_PRODUCT_PRICE_FROM;
}
