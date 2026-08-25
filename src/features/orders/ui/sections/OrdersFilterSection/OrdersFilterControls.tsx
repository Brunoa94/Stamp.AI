import { LayoutGrid, List, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type {
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../../../lib/types/filters";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";

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
    <div className="flex flex-col gap-4">
      <Span
        variant="default"
        className="font-bold uppercase text-sm tracking-[0.4em] text-(--color-stamp-taupe)"
      >
        {t("archiveFiltering")}
      </Span>

      <div className="flex flex-wrap items-center gap-4">
        <OrdersStatusSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
        />

        <OrdersTimeSelect value={timeFilter} onChange={onTimeFilterChange} />

        <Button
          onClick={onClearFilters}
          variant="ghost"
          className="h-10 flex items-center gap-2 px-4 font-body font-bold uppercase text-sm tracking-widest text-(--color-stamp-taupe) hover:bg-transparent hover:text-(--color-stamp-gold)"
        >
          <RotateCcw className="h-4 w-4" />
          {t("clearArchive")}
        </Button>

        <OrdersViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}

interface OrdersStatusSelectPropsI {
  value: OrdersStatusFilterType;
  onChange: (value: OrdersStatusFilterType) => void;
}

function OrdersStatusSelect({ value, onChange }: OrdersStatusSelectPropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersStatusFilterType)}
    >
      <SelectTrigger
        aria-label={t("statusAriaLabel")}
        className="h-10 w-auto min-w-48 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 font-body font-bold uppercase text-sm tracking-widest text-(--color-stamp-chocolate) shadow-none hover:border-(--color-stamp-chocolate)"
      >
        <SelectValue placeholder={t("status.allPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("status.allPlaceholder")}</SelectItem>
        <SelectItem value="delivered">{t("status.delivered")}</SelectItem>
        <SelectItem value="shipped">{t("status.shipped")}</SelectItem>
        <SelectItem value="processing">{t("status.processing")}</SelectItem>
        <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface OrdersTimeSelectPropsI {
  value: OrdersTimeFilterType;
  onChange: (value: OrdersTimeFilterType) => void;
}

function OrdersTimeSelect({ value, onChange }: OrdersTimeSelectPropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersTimeFilterType)}
    >
      <SelectTrigger
        aria-label={t("timeAriaLabel")}
        className="h-10 w-auto min-w-40 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 font-body font-bold uppercase text-sm tracking-widest text-(--color-stamp-chocolate) shadow-none hover:border-(--color-stamp-chocolate)"
      >
        <SelectValue placeholder={t("time.last30")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30">{t("time.last30")}</SelectItem>
        <SelectItem value="90">{t("time.last90")}</SelectItem>
        <SelectItem value="2023">{t("time.year2023")}</SelectItem>
        <SelectItem value="all">{t("time.allTime")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface OrdersViewModeTogglePropsI {
  viewMode: OrdersViewModeType;
  onChange: (mode: OrdersViewModeType) => void;
}

function OrdersViewModeToggle({
  viewMode,
  onChange,
}: OrdersViewModeTogglePropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <div className="hidden lg:flex items-center gap-2 border-l border-(--color-stamp-divider) pl-4">
      <Button
        onClick={() => onChange("list")}
        variant="ghost"
        size="icon"
        aria-label={t("listViewAriaLabel")}
        className={`h-10 w-10 transition-all hover:scale-110 ${viewMode === "list" ? "text-(--color-stamp-chocolate)" : "text-(--color-stamp-taupe)"}`}
      >
        <List className="h-5 w-5" />
      </Button>
      <Button
        onClick={() => onChange("grid")}
        variant="ghost"
        size="icon"
        aria-label={t("gridViewAriaLabel")}
        className={`h-10 w-10 transition-all hover:scale-110 ${viewMode === "grid" ? "text-(--color-stamp-chocolate)" : "text-(--color-stamp-taupe)"}`}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
    </div>
  );
}
