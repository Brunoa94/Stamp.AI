"use client";

import { Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";

/**
 * ReviewActions
 *
 * Action buttons for adding to bag and creating another product.
 * On mobile, the primary action (Bag It) is shown in the sticky footer.
 */

interface PropsI {
  isAddingToCart: boolean;
  onBagIt: () => void;
  onBagItAndCreateAnother: () => void;
}

export function ReviewActions({
  isAddingToCart,
  onBagIt,
  onBagItAndCreateAnother,
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
          onClick={onBagItAndCreateAnother}
          disabled={isAddingToCart}
          className="w-full bg-(--color-stamp-gold) text-(--color-stamp-chocolate) border-2 border-(--color-stamp-gold) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 md:py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {t("bagItAndCreateAnother")}
        </Button>
      </div>

      {/* Mobile: Bag It & Create Another button (Bag It is in footer) */}
      <div className="md:hidden">
        <Button
          onClick={onBagItAndCreateAnother}
          disabled={isAddingToCart}
          className="w-full bg-(--color-stamp-gold) text-(--color-stamp-chocolate) border-2 border-(--color-stamp-gold) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {t("bagItAndCreateAnother")}
        </Button>
      </div>
    </div>
  );
}
