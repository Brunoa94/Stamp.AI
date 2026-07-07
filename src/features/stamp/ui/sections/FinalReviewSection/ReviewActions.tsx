import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";

/**
 * ReviewActions
 *
 * Action buttons for adding to bag or buying now
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
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onBagIt}
        disabled={isAddingToCart}
        className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="w-5 h-5" />
        {isAddingToCart ? "ADDING..." : "BAG IT"}
      </Button>
      <Button
        onClick={onBuyNow}
        disabled={isAddingToCart}
        className="w-full bg-transparent text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAddingToCart ? "PROCESSING..." : "BUY NOW"}
      </Button>
    </div>
  );
}
