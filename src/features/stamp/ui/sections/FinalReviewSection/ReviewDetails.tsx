import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { ProductSummary } from "./ProductSummary";
import { ReviewActions } from "./ReviewActions";

/**
 * ReviewDetails
 *
 * Right panel with product details and actions
 */

interface PropsI {
  productName: string;
  color?: string;
  size?: string;
  price: string;
  isAddingToCart: boolean;
  onBagIt: () => void;
  onBuyNow: () => void;
}

export function ReviewDetails({
  productName,
  color,
  size,
  price,
  isAddingToCart,
  onBagIt,
  onBuyNow,
}: PropsI) {
  const t = useTranslations("stamp.finalReview");

  return (
    <div className="p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      <div className="space-y-6 mb-12">
        <ProductSummary
          productName={productName}
          color={color}
          size={size}
          price={price}
        />
      </div>

      <ReviewActions
        isAddingToCart={isAddingToCart}
        onBagIt={onBagIt}
        onBuyNow={onBuyNow}
      />
    </div>
  );
}
