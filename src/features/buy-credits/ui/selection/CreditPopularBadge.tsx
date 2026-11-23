import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

/** Amber "popular" tag sitting on the top edge of a credit package card. */
export function CreditPopularBadge() {
  const t = useTranslations("buyCredits.selection");

  return (
    <Span
      variant="pill"
      className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-(--color-stamp-gold) px-2 py-0.5 text-(--color-stamp-chocolate)"
    >
      <Sparkles className="w-3 h-3" />
      {t("popularBadge")}
    </Span>
  );
}
