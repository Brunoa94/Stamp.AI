import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { dashboardTheme } from "@/theme/components";

interface PropsI {
  ordersCount: number;
}

export function RecentOrdersCardHeader({ ordersCount }: PropsI) {
  return (
    <div className={dashboardTheme.orders.header}>
      <div className="flex items-center gap-3">
        <Heading as="h4" variant="card" className={dashboardTheme.orders.title}>
          RECENT ORDERS
        </Heading>
        <Span
          variant="micro"
          className="px-2 py-1 bg-green/10 text-green border border-green/20"
        >
          {ordersCount} LOGS
        </Span>
      </div>
      <Link
        href="/orders"
        className="text-[10px] font-bold tracking-[0.2em] uppercase text-ink/40 hover:text-ink/70 transition-colors"
      >
        VIEW ARCHIVE LOG
      </Link>
    </div>
  );
}
