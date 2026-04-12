import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, Repeat, Sparkles } from "lucide-react";
import { Button } from "@/features/ui/button";
import { ordersTheme } from "@/theme/components";
import { OrderWithItemsT } from "@/types/order";
import { cn } from "@/lib/utils";
import { useOrderMoreActions } from "../../hooks/useOrderMoreActions";
import {
  canCancelOrder,
  canProceedToPayment,
} from "../../utils/lifecycleRules";

interface OrdersMobileCardActionsProps {
  order: OrderWithItemsT;
  onViewOrder: (order: OrderWithItemsT) => void;
  onReorder: (order: OrderWithItemsT) => void;
  onCancelOrder?: (order: OrderWithItemsT) => void;
  onProceedToPayment?: (order: OrderWithItemsT) => void;
}

export function OrdersMobileCardActions({
  order,
  onViewOrder,
  onReorder,
  onCancelOrder,
  onProceedToPayment,
}: OrdersMobileCardActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCancelled = order.status === "cancelled";
  const canCancel = canCancelOrder(order);
  const canProceed = canProceedToPayment(order);
  const { supportEmailHref, reuseImageUrl } = useOrderMoreActions(order);

  return (
    <>
      <div className={ordersTheme.mobileCard.actions}>
        <Button
          onClick={() => onViewOrder(order)}
          variant="default"
          size="default"
          className={ordersTheme.mobileCard.viewButton}
        >
          View
        </Button>
        <Button
          onClick={() => onReorder(order)}
          variant="outline"
          size="default"
          className={ordersTheme.mobileCard.reorderButton}
        >
          Reorder
        </Button>
        {canProceed ? (
          <Button
            onClick={() => onProceedToPayment?.(order)}
            variant="outline"
            size="default"
          >
            Pay now
          </Button>
        ) : null}
        {isCancelled ? (
          <span className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-muted-foreground max-w-23.25">
            Canceled
          </span>
        ) : (
          <Button
            onClick={() => canCancel && onCancelOrder?.(order)}
            variant="destructive"
            size="default"
            disabled={!canCancel}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="flex justify-center mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((previous) => !previous)}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-expanded={isExpanded}
        >
          More actions
          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Link href={reuseImageUrl}>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Use same image
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReorder(order)}
            className="w-full justify-start"
          >
            <Repeat className="mr-2 h-3.5 w-3.5" />
            Reorder
          </Button>

          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <a href={supportEmailHref}>
              <Mail className="mr-2 h-3.5 w-3.5" />
              Report about this order
            </a>
          </Button>
        </div>
      )}
    </>
  );
}
