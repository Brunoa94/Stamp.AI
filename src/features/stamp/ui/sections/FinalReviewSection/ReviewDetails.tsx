import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { ProductSummary } from "./ProductSummary";
import { ReviewActions } from "./ReviewActions";

/**
 * ReviewDetails
 *
 * Right panel with product details and actions. On mobile the carousel
 * column is hidden, so a compact mockup thumbnail renders here instead.
 */

interface PropsI {
  /** Mockup shown as a compact thumbnail on mobile (carousel is md+ only). */
  mockupUrl?: string;
  productName: string;
  color?: string;
  size?: string;
  price: string;
  isAddingToCart: boolean;
  onBagIt: () => void;
  onBuyNow: () => void;
}

export function ReviewDetails({
  mockupUrl,
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
    <div className="p-6 pt-16 md:pt-10 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-white">
      {/* Mobile-only mockup thumbnail (the carousel column is hidden below md) */}
      {mockupUrl && (
        <div className="md:hidden relative mx-auto mb-4 h-36 aspect-square bg-white p-1 shadow-lg border border-(--color-stamp-divider)">
          <Image
            src={mockupUrl}
            alt={t("mockupAlt")}
            fill
            unoptimized
            className="object-cover"
            sizes="144px"
          />
        </div>
      )}

      <Heading
        as="h2"
        variant="panelTitle"
        className="text-(--color-stamp-chocolate) mb-4 md:mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      <div className="space-y-6 mb-6 md:mb-12">
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
