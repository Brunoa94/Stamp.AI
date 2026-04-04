import { Coins, Sparkles } from "lucide-react";
import type { PromoCodeTypeT } from "@/types/promocode";

export function mapPromoToLabel(type: PromoCodeTypeT, value: number) {
  if (type === "percentage") {
    return `${value}% OFF`;
  }

  return `€${value} OFF`;
}

export function mapPromoTypeToIcon(type: PromoCodeTypeT) {
  return type === "percentage" ? Sparkles : Coins;
}
