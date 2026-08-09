import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

/**
 * ProductSummary
 *
 * Product details card with name, specs, and price
 */

interface PropsI {
  productName: string;
  color?: string;
  size?: string;
  price: string;
}

export function ProductSummary({ productName, color, size, price }: PropsI) {
  const t = useTranslations("stamp.finalReview");

  return (
    <div className="p-6 border border-(--color-stamp-divider)">
      <div className="flex justify-between items-start mb-4">
        <Heading
          as="h4"
          variant="item"
          className="text-(--color-stamp-chocolate)"
        >
          {productName}
        </Heading>
        <Star className="text-(--color-stamp-gold) w-5 h-5" />
      </div>
      <Span
        variant="micro"
        className="text-(--color-stamp-taupe) block mb-4 md:mb-8"
      >
        {t("productDetails", { color: color || "Black", size: size || "M" })}
      </Span>
      <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-2 pt-4 md:pt-6 border-t border-(--color-stamp-divider)">
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          {t("finalValuation")}
        </Span>
        <Heading
          as="h3"
          variant="section"
          className="text-(--color-stamp-chocolate) text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl"
        >
          {price}
        </Heading>
      </div>
    </div>
  );
}
