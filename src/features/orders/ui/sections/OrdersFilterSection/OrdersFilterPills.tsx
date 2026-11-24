import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { OrdersFilterPillType } from "../../../lib/types/filters";

interface PropsI {
  pills: OrdersFilterPillType[];
}

export function OrdersFilterPills({ pills }: PropsI) {
  const t = useTranslations("orders.filterPills");

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <Span
          key={pill.key}
          unstyled
          className="inline-flex items-center gap-2 rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) py-1.5 pl-3 pr-1.5 text-sm font-semibold text-(--color-stamp-chocolate)"
        >
          {pill.label}
          <Button
            onClick={pill.onClear}
            variant="ghost"
            size="icon-sm"
            aria-label={t("clearFilter", { label: pill.label })}
            className="h-6 w-6 rounded-md p-0 hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-gold-text)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Span>
      ))}
    </div>
  );
}
