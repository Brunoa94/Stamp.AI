import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";
import { ordersViewToggleVariants } from "../../../lib/variants/ordersControlVariants";

interface PropsI {
  viewMode: OrdersViewModeType;
  onChange: (mode: OrdersViewModeType) => void;
}

export function OrdersViewModeToggle({ viewMode, onChange }: PropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <div className="hidden lg:flex items-center gap-1 border-l border-(--color-stamp-divider) pl-3">
      <Button
        onClick={() => onChange("list")}
        variant="ghost"
        size="icon"
        aria-label={t("listViewAriaLabel")}
        className={ordersViewToggleVariants({ active: viewMode === "list" })}
      >
        <List className="h-5 w-5" />
      </Button>
      <Button
        onClick={() => onChange("grid")}
        variant="ghost"
        size="icon"
        aria-label={t("gridViewAriaLabel")}
        className={ordersViewToggleVariants({ active: viewMode === "grid" })}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
    </div>
  );
}
