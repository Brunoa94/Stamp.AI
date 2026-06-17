import { Paragraph } from "@/features/ui/paragraph";
import { dashboardTheme } from "@/theme/components";

export function RecentOrdersEmptyState() {
  return (
    <Paragraph variant="sm" className={dashboardTheme.orders.emptyState}>
      NO RECENT ORDERS YET. START A NEW DESIGN TO PLACE YOUR FIRST ORDER.
    </Paragraph>
  );
}
