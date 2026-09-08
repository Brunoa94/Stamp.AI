import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { PolaroidPreview } from "../../components/PolaroidPreview/PolaroidPreview";
import { ProductSummary } from "./ProductSummary";
import { ReviewActions } from "./ReviewActions";
import type { ProductTypeIdType } from "../../../lib/types/stampTypes";

/**
 * ReviewDetails
 *
 * Right panel with product details and actions. On mobile the carousel
 * column is hidden, so a polaroid-style mockup preview renders here instead,
 * using the shared PolaroidPreview component.
 */

interface PropsI {
  /** Mockup shown as a polaroid preview on mobile (carousel is md+ only). */
  mockupUrl?: string;
  productName: string;
  productDescription?: string | null;
  productType: ProductTypeIdType;
  color?: string;
  size?: string;
  price: string;
  isAddingToCart: boolean;
  onBagIt: () => void;
  onBagItAndCreateAnother: () => void;
}

export function ReviewDetails({
  mockupUrl,
  productName,
  productDescription,
  productType,
  color,
  size,
  price,
  isAddingToCart,
  onBagIt,
  onBagItAndCreateAnother,
}: PropsI) {
  const t = useTranslations("stamp.finalReview");

  return (
    <div className="p-6 pt-24 md:pt-10 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-white">
      {/* Mobile-only polaroid mockup preview (carousel is md+ only) */}
      {mockupUrl && (
        <div className="md:hidden flex justify-center mb-6">
          <PolaroidPreview
            imageUrl={mockupUrl}
            alt={t("mockupAlt")}
            badgeText={t("previewSealed")}
            fullscreenLabel={t("viewFullscreen")}
            closeLabel={t("closeFullscreen")}
            hintText={t("pressEscToClose")}
            size="sm"
          />
        </div>
      )}

      <Heading
        as="h2"
        variant="panelTitle"
        className="text-(--color-stamp-chocolate) mb-4 md:mb-6"
      >
        {t.rich(`title.${productType}`, {
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
          productDescription={productDescription}
          color={color}
          size={size}
          price={price}
        />
      </div>

      <ReviewActions
        isAddingToCart={isAddingToCart}
        onBagIt={onBagIt}
        onBagItAndCreateAnother={onBagItAndCreateAnother}
      />
    </div>
  );
}
