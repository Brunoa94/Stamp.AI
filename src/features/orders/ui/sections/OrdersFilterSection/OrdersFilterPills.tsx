import { X } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { OrdersFilterPillType } from "../../../lib/types/filters";

interface PropsI {
  pills: OrdersFilterPillType[];
}

export function OrdersFilterPills({ pills }: PropsI) {
  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <Span
          key={pill.key}
          unstyled
          className="inline-flex items-center gap-2 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-(--color-stamp-chocolate)"
        >
          {pill.label}
          <Button
            onClick={pill.onClear}
            variant="ghost"
            size="icon-sm"
            aria-label={`Clear ${pill.label} filter`}
            className="h-4 w-4 p-0 hover:bg-transparent hover:text-(--color-stamp-gold)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Span>
      ))}
    </div>
  );
}
