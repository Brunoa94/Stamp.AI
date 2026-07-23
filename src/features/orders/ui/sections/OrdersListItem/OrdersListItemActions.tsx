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
    <div className="flex w-full flex-col gap-2 lg:w-40">
      <Button onClick={() => onOpenDetails(order)} variant="primary-compact">
        {displayedStatus === "Delivered"
          ? t("viewBlueprint")
          : t("trackProtocol")}
      </Button>
      {canCancel ? (
        <Button
          onClick={() => onCancelOrder(order)}
          variant="secondary-compact"
        >
          {t("haltOrder")}
        </Button>
      ) : (
        <Button onClick={onReorder} variant="secondary-compact">
          {t("reorder")}
        </Button>
      )}
    </div>
  );
}
