/**
 * FeaturedCarouselHint
 *
 * Mobile swipe hint displayed below the carousel.
 */

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

export function FeaturedCarouselHint() {
  const t = useTranslations("home.featured");

  return (
    <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
      <Span variant="micro" className="text-(--color-stamp-taupe)">
        {t("swipeHint")}
      </Span>
      <ArrowRight className="h-3.5 w-3.5 text-(--color-stamp-taupe)" />
    </div>
  );
}
