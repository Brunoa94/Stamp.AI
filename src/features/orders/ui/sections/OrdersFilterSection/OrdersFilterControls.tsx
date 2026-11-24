import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type {
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../../../lib/types/filters";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";
import { OrdersStatusSelect } from "./OrdersStatusSelect";
import { OrdersTimeSelect } from "./OrdersTimeSelect";
import { OrdersViewModeToggle } from "./OrdersViewModeToggle";

interface PropsI {
  viewMode: OrdersViewModeType;
  onViewModeChange: (mode: OrdersViewModeType) => void;
  statusFilter: OrdersStatusFilterType;
  onStatusFilterChange: (status: OrdersStatusFilterType) => void;
  timeFilter: OrdersTimeFilterType;
  onTimeFilterChange: (time: OrdersTimeFilterType) => void;
  onClearFilters: () => void;
}

export function OrdersFilterControls({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  onClearFilters,
}: PropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <div className="flex flex-col gap-3">
      <Span variant="label" className="text-(--color-stamp-gold-text)">
        {t("archiveFiltering")}
      </Span>

      <div className="flex flex-wrap items-center gap-3">
        <OrdersStatusSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
        />

        <OrdersTimeSelect value={timeFilter} onChange={onTimeFilterChange} />

        <Button onClick={onClearFilters} variant="stamp-filter-ghost">
          <RotateCcw className="h-4 w-4" />
          {t("clearArchive")}
        </Button>

        <OrdersViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}
