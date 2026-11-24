import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { getStatusBadgeClass } from "../../../lib/helpers/statusPresentation";
import { orderStatusBadgeVariants } from "../../../lib/variants/orderStatusBadgeVariants";

interface PropsI {
  displayedStatus: string;
}

export function OrdersGridItemStatusBadge({ displayedStatus }: PropsI) {
  const tStatus = useTranslations("orders.statusBadge");

  return (
    // White backing keeps the tinted status badge readable on the photo.
    <div className="absolute right-4 top-4 z-10 rounded-md bg-(--color-stamp-white)">
      <Span
        variant="badge"
        className={cn(
          orderStatusBadgeVariants(),
          getStatusBadgeClass(displayedStatus),
        )}
      >
        {tStatus(displayedStatus)}
      </Span>
    </div>
  );
}
