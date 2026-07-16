import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import type { OrderWithItemsT } from "@/types/order";

interface PropsI {
  order: OrderWithItemsT;
  displayedStatus: string;
  canCancel: boolean;
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersListItemActions({
  order,
  displayedStatus,
  canCancel,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const t = useTranslations("orders.listItem");

  return (
    <div className="flex w-full flex-col gap-2 lg:w-48">
      <Button
        onClick={() => onOpenDetails(order)}
        variant="default"
        className="w-full bg-(--color-stamp-chocolate) px-6 py-3 font-heading font-semibold uppercase text-base tracking-[0.2em] text-(--color-stamp-white) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-(--color-stamp-gold) hover:shadow-(--shadow-stamp-gold-cta)"
      >
        {displayedStatus === "Delivered"
          ? t("viewBlueprint")
          : t("trackProtocol")}
      </Button>
      {canCancel ? (
        <Button
          onClick={() => onCancelOrder(order)}
          variant="outline"
          className="w-full border-(--color-stamp-divider) px-6 py-3 font-heading font-semibold uppercase text-base tracking-[0.2em] text-(--color-stamp-chocolate) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white)"
        >
          {t("haltOrder")}
        </Button>
      ) : (
        <Button
          onClick={onReorder}
          variant="outline"
          className="w-full border-(--color-stamp-divider) px-6 py-3 font-heading font-semibold uppercase text-base tracking-[0.2em] text-(--color-stamp-chocolate) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white)"
        >
          {t("reorder")}
        </Button>
      )}
    </div>
  );
}
