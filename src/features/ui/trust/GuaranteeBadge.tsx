import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * GuaranteeBadge
 *
 * Restates the 30-day guarantee the business already offers (see the FAQ) in a
 * small, reassuring block. Meant to sit near a buy CTA or on the product /
 * cart page. Copy lives under `trust.guarantee`.
 */

interface GuaranteeBadgeProps {
  className?: string;
}

export function GuaranteeBadge({ className }: GuaranteeBadgeProps) {
  const t = useTranslations("trust.guarantee");

  return (
    <div
      className={cn(
        "flex items-start gap-3 border border-(--color-stamp-gold)/30 bg-(--color-stamp-gold)/5 p-4",
        className
      )}
    >
      <BadgeCheck
        className="mt-0.5 h-6 w-6 shrink-0 text-(--color-stamp-gold)"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          {t("title")}
        </Span>
        <p className="text-sm text-(--color-stamp-taupe)">{t("body")}</p>
      </div>
    </div>
  );
}
