import { useTranslations } from "next-intl";
import { buttonVariants } from "@/features/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type { OrdersTimeFilterType } from "../../../lib/types/filters";

interface PropsI {
  value: OrdersTimeFilterType;
  onChange: (value: OrdersTimeFilterType) => void;
}

export function OrdersTimeSelect({ value, onChange }: PropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersTimeFilterType)}
    >
      <SelectTrigger
        aria-label={t("timeAriaLabel")}
        className={buttonVariants({ variant: "stamp-filter", className: "w-auto min-w-40" })}
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
