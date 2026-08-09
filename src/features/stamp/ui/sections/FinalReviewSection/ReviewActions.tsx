"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";

/**
 * ReviewActions
 *
 * Action buttons for adding to bag or buying now.
 * On mobile, the primary action (Bag It) is shown in the sticky footer.
 */

interface PropsI {
  isAddingToCart: boolean;
  onBagIt: () => void;
  onBuyNow: () => void;
}

export function ReviewActions({
  isAddingToCart,
  onBagIt,
  onBuyNow,
}: PropsI) {
  const t = useTranslations("stamp.finalReview");

  // Register primary action for mobile sticky footer (Step 8)
  useRegisterMobileAction(8, {
    action: onBagIt,
    label: isAddingToCart ? t("adding") : t("bagIt"),
    disabled: isAddingToCart,
    loading: isAddingToCart,
  });

  return (
    <div className="pb-28 md:pb-0">
      {/* Desktop: both buttons stacked */}
      <div className="hidden md:flex flex-col gap-3 md:gap-4">
        <Button
          onClick={onBagIt}
          disabled={isAddingToCart}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 md:py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-5 h-5" />
          {isAddingToCart ? t("adding") : t("bagIt")}
        </Button>
        <Button
          onClick={onBuyNow}
          disabled={isAddingToCart}
          className="w-full bg-transparent text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 md:py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? t("processing") : t("buyNow")}
        </Button>
      </div>

      {/* Mobile: only show Buy Now button (Bag It is in footer) */}
      <div className="md:hidden">
        <Button
          onClick={onBuyNow}
          disabled={isAddingToCart}
          className="w-full bg-transparent text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? t("processing") : t("buyNow")}
        </Button>
      </div>
    </div>
  );
}
