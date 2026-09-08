import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { getStatusBadgeClass } from "../../../lib/helpers/statusPresentation";

interface PropsI {
  displayedStatus: string;
}

export function OrdersGridItemStatusBadge({ displayedStatus }: PropsI) {
  const tStatus = useTranslations("orders.statusBadge");

  return (
    <div className="absolute right-2 top-2 z-10">
      <Span
        unstyled
        className={`status-badge uppercase px-2! py-1! text-lg! backdrop-blur-md ${getStatusBadgeClass(displayedStatus)}`}
      >
        {tStatus(displayedStatus)}
      </Span>
    </div>
  );
}
