import { useTranslations } from "next-intl";
import { buttonVariants } from "@/features/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type { OrdersStatusFilterType } from "../../../lib/types/filters";

interface PropsI {
  value: OrdersStatusFilterType;
  onChange: (value: OrdersStatusFilterType) => void;
}

export function OrdersStatusSelect({ value, onChange }: PropsI) {
  const t = useTranslations("orders.filterControls");

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersStatusFilterType)}
    >
      <SelectTrigger
        aria-label={t("statusAriaLabel")}
        className={buttonVariants({ variant: "stamp-filter", className: "w-auto min-w-48 rounded-md" })}
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
