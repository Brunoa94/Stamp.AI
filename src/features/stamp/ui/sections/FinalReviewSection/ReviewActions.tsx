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

export function ReviewActions({ isAddingToCart, onBagIt, onBuyNow }: PropsI) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onBagIt}
        disabled={isAddingToCart}
        variant="stamp-primary"
        className="w-full gap-3"
      >
        <ShoppingBag className="w-5 h-5" />
        {isAddingToCart ? "ADDING..." : "BAG IT"}
      </Button>
      <Button
        onClick={onBuyNow}
        disabled={isAddingToCart}
        variant="stamp-outline"
        className="w-full"
      >
        {isAddingToCart ? "PROCESSING..." : "BUY NOW"}
      </Button>
    </div>
  );
}
